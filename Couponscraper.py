import time
import re
import os
import json
import requests
from playwright.sync_api import sync_playwright

if os.name != 'nt': # 윈도우 환경이 아닐 때만 실행 (리눅스용)
    os.environ['TZ'] = 'Asia/Seoul'
    time.tzset()

# GIST에 추출한 5가지 데이터 Json 형태로 저장
def update_gist(publisher_name, asset_name, coupon_code, asset_url):
    gist_id = os.environ.get("GIST_ID") 
    github_token = os.environ.get("GH_TOKEN")
    
    if not gist_id or not github_token:
        print("❌ [에러] GIST_ID 또는 GH_TOKEN 환경변수가 설정되지 않았습니다.")
        return

    payload = {
        "description": "Unity Asset Store Free Asset Coupon Info (Enhanced)",
        "files": {
            "unity_free_asset.json": {
                "content": json.dumps({
                    "publisher_name": publisher_name, # 퍼블리셔(제작사) 이름
                    "asset_name": asset_name,         # 에셋 고유 명칭
                    "coupon_code": coupon_code,       # 쿠폰 코드
                    "asset_url": asset_url,           # 에셋 상세 주소
                    "last_updated": time.strftime("%Y-%m-%d %H:%M:%S") # 동기화 타임스탬프 (한국 시간 기준)
                }, ensure_ascii=False, indent=2)
            }
        }
    }

    headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json"
    }

    url = f"https://api.github.com/gists/{gist_id}"
    print("🚀 Gist 업데이트 중...")
    response = requests.patch(url, headers=headers, json=payload)

    if response.status_code == 200:
        print("🎉 Gist가 성공적으로 업데이트되었습니다!")
    else:
        print(f"❌ Gist 업데이트 실패 (상태 코드: {response.status_code})")
        print(response.text)

def extract_and_save_coupon():
    base_url = "https://assetstore.unity.com"
    publisher_name = "UNKNOWN"
    asset_name = "UNKNOWN"
    coupon_code = "UNKNOWN"
    asset_url = "UNKNOWN"
    
    with sync_playwright() as p:
        print("🤖 가상 크롬 브라우저를 실행합니다...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        url = f"{base_url}/ko-KR/publisher-sale"
        print(f"🌐 페이지 주소로 이동 중: {url}")
        page.goto(url)
        
        print("⏳ 자바스크립트 데이터 로딩을 위해 5초간 대기합니다...")
        time.sleep(5)
        
        try:
            # 예외 처리 추가: 'Check back soon!' 찾기
            sale_title_selector = "h2.header-large"

            if page.locator(sale_title_selector).count() > 0 and "Check back soon" in page.locator(sale_title_selector).inner_text():
                # [★ 세일 기간 처리] 제목이 Check back soon 일 때의 커스텀 데이터 세팅
                print("🛑 [안내] 유니티 세일 기간(Check back soon)을 감지했습니다.")
                publisher_name = "Unity"
                asset_name = "Check back soon!"
                coupon_code = "NOT_AVAILABLE"
                asset_url = url
            else:
                # 1. 퍼블리셔 이름 추출 (예: Gustav Olsson AB)
                publisher_selector = "span.caption.mb-5"
                if page.locator(publisher_selector).count() > 0:
                    raw_publisher = page.locator(publisher_selector).inner_text()
                    publisher_name = raw_publisher.replace("asset giveaway", "").strip()
                else:
                    print("⚠️ 퍼블리셔 셀렉터를 찾지 못했습니다.")

                # 2. 에셋 이름 추출 (예: Ocean Toolkit)
                asset_name_selector = "h2.header-mid"
                if page.locator(asset_name_selector).count() > 0:
                    asset_name = page.locator(asset_name_selector).inner_text().strip()
                else:
                    print("⚠️ 에셋 이름 셀렉터를 찾지 못했습니다.")

                # 3. 쿠폰 코드 추출
                coupon_selector = "span.body.mt-5" 
                page.wait_for_selector(coupon_selector, timeout=5000)
                full_text = page.locator(coupon_selector).inner_text()
            
                match = re.search(r"the coupon code ([A-Z0-9]+)", full_text)
                if match:
                    coupon_code = match.group(1)
                else:
                    print("⚠️ 쿠폰 패턴을 찾지 못했습니다.")

                # 4. 에셋 상세 주소(URL) 추출
                link_selector = 'a[aria-label="Get your free gift"]'
                if page.locator(link_selector).count() > 0:
                    relative_path = page.locator(link_selector).get_attribute("href")
                    if relative_path:
                        asset_url = base_url + relative_path if relative_path.startswith("/") else relative_path
                        print(f"🔗 에셋 상세 주소 추출 성공: {asset_url}")
                else:
                    print("⚠️ 무료 선물 받기 링크를 찾지 못했습니다.")

            print("\n==================================================")
            print("📊 최종 추출 데이터 확인 (4가지)")
            print(f"  - 퍼블리셔: {publisher_name}")
            print(f"  - 에셋 이름: {asset_name}")
            print(f"  - 쿠폰 코드: {coupon_code}")
            print(f"  - 에셋 링크: {asset_url}")
            print("==================================================\n")
            
            # 모든 데이터를 Gist에 전송
            update_gist(publisher_name, asset_name, coupon_code, asset_url)

        except Exception as e:
            print(f"❌ [실패] 에러 발생: {e}")
            
        browser.close()
        print("🤖 브라우저를 안전하게 종료했습니다.")

if __name__ == "__main__":
    extract_and_save_coupon()