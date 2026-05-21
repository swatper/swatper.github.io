import time
import re
import os
import json
import requests
from playwright.sync_api import sync_playwright

# GIST에 쿠폰 번호와 에셋 URL, 날짜 저장
def update_gist(coupon_code, asset_url):
    gist_id = os.environ.get("GIST_ID") 
    github_token = os.environ.get("GH_TOKEN")
    
    if not gist_id or not github_token:
        print("❌ [에러] GIST_ID 또는 GH_TOKEN 환경변수가 설정되지 않았습니다.")
        return

    # 유니티 클라이언트가 읽을 JSON 구조 정의
    payload = {
        "description": "Unity Asset Store Free Asset Coupon Info",
        "files": {
            "unity_free_asset.json": {
                "content": json.dumps({
                    "coupon_code": coupon_code,
                    "asset_url": asset_url,
                    "last_updated": time.strftime("%Y-%m-%d %H:%M:%S")
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
            coupon_selector = "span.body.mt-5" 
            page.wait_for_selector(coupon_selector, timeout=5000)
            
            full_text = page.locator(coupon_selector).inner_text()
            print(f"📝 긁어온 원본 문장: {full_text}")
            
            match = re.search(r"the coupon code ([A-Z0-9]+)", full_text)
            if match:
                coupon_code = match.group(1)
                print(f"🎉 쿠폰 코드 추출 성공: {coupon_code}")
            else:
                print("⚠️ 문장은 가져왔으나 쿠폰 패턴을 찾지 못했습니다.")

            link_selector = 'a[aria-label="Get your free gift"]'
            if page.locator(link_selector).count() > 0:
                relative_path = page.locator(link_selector).get_attribute("href")
                if relative_path:
                    asset_url = base_url + relative_path if relative_path.startswith("/") else relative_path
                    print(f"🔗 에셋 상세 주소 추출 성공: {asset_url}")
            else:
                print("⚠️ 무료 선물 받기 버튼(링크)을 찾지 못했습니다.")

            print("\n==================================================")
            print("📊 최종 추출 데이터 확인")
            print(f"  - 쿠폰 코드: {coupon_code}")
            print(f"  - 에셋 링크: {asset_url}")
            print("==================================================\n")
            
            # 크롤링 성공 시 Gist 업데이트 호출
            update_gist(coupon_code, asset_url)
                
        except Exception as e:
            print(f"❌ [실패] 에러 발생: {e}")
            
        browser.close()
        print("🤖 브라우저를 안전하게 종료했습니다.")

if __name__ == "__main__":
    extract_and_save_coupon()