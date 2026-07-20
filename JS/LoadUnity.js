document.addEventListener('DOMContentLoaded', function() {
    const placeholder = document.getElementById('gamePlace');
      
    //#region Mobile
    //1. 모바일 기기 판별 함수
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // 2. 모바일 안내 메시지 표시 함수
    function displayMobileMessage() {
        const message = document.createElement('div');
        message.className = 'mobile-warning-message';
        
        message.style.cssText = `
            background: rgba(20, 24, 33, 0.85);
            border: 1px solid rgba(255, 235, 153, 0.3);
            border-radius: 16px;
            padding: 32px 24px;
            width: 90%;
            max-width: 450px;
            margin: 40px auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 235, 153, 0.1);
            backdrop-filter: blur(8px);
            text-align: center;
            color: #ffffff;
        `;

        message.innerHTML = `
            <div style="font-size: 2.8rem; margin-bottom: 14px; filter: drop-shadow(0 0 8px rgba(255, 235, 153, 0.6));">📱</div>
            <h2 style="color: #FFEB99; font-size: 1.5rem; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.5px;">
                모바일 환경 안내
            </h2>
            <p style="color: #E2E8F0; font-size: 0.95rem; line-height: 1.6; margin-bottom: 12px;">
            본 포트폴리오는 <strong style="color: #FFEB99;">PC 환경</strong>에 최적화되어 있습니다.<br>
            (데스크톱 및 노트북 환경을 권장합니다)
            </p>
            <p style="color: #94A3B8; font-size: 0.85rem; line-height: 1.5; margin-bottom: 24px;">
                모바일에서는 게임 플레이가 제한될 수 있으니<br>상단의 노션 페이지를 통해 확인해 보세요!
            </p>
        `;
        
        placeholder.appendChild(message);
        placeholder.style.height = 'auto';
        placeholder.style.minHeight = 'initial';
    }
    
    if (false) { // -> 모바일 접근 허용
        //모바일일 경우: 메시지 표시 후 게임 로드 중단
        displayMobileMessage();
        return;
    }

    //#endregion

    //#region PC
    //1.게임 파일 경로 설정
    const gameIframeSrc = './Unity/index.html';

    //유니티 원본 해상도 정의
    const ORIGINAL_WIDTH = 1920;
    const ORIGINAL_HEIGHT = 1080;

    //2. 준비 중 or 파일 부재 메시지
    function displayNotReadyMessage() {
        const message = document.createElement('div');
        message.className = 'not-ready-warning-message';

        message.style.cssText = `
            background: rgba(20, 24, 33, 0.85);
            border: 1px solid rgba(255, 235, 153, 0.3);
            border-radius: 16px;
            padding: 32px 24px;
            width: 90%;
            max-width: 450px;
            margin: 40px auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 235, 153, 0.1);
            backdrop-filter: blur(8px);
            text-align: center;
            color: #ffffff;
        `;

        message.innerHTML = `
            <div style="font-size: 2.8rem; margin-bottom: 14px; filter: drop-shadow(0 0 10px rgba(255, 235, 153, 0.6));">🚧</div>
            <h2 style="color: #FFEB99; font-size: 1.5rem; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.5px; line-height: 1.3;">
                곧 찾아뵙겠습니다!
            </h2>
            <p style="color: #E2E8F0; font-size: 0.95rem; line-height: 1.6; margin-bottom: 12px;">
                이 부분은 현재 <strong style="color: #FFEB99;">마무리 작업 중</strong>입니다.<br>
                완성된 모습으로 빠르게 업데이트할게요!
            </p>
            <p style="color: #94A3B8; font-size: 0.85rem; line-height: 1.5; margin-bottom: 24px;">
                조금만 기다려 주시거나,<br>다른 카테고리를 먼저 확인해 보세요. 😊
            </p>
        `;

        placeholder.appendChild(message);
        placeholder.style.height = 'auto';
        placeholder.style.minHeight = 'initial';
    }



    function adjustIframeScale(iframeElement) {
        if (!iframeElement) return;

        const containerWidth = placeholder.clientWidth;
        const containerHeight = placeholder.clientHeight;
        
        const scaleX = containerWidth / ORIGINAL_WIDTH;
        const scaleY = containerHeight / ORIGINAL_HEIGHT;
        const scale = Math.min(scaleX, scaleY);
        
        // iframe을 원본 해상도로 설정 후 scale 적용
        iframeElement.style.width = ORIGINAL_WIDTH + 'px';
        iframeElement.style.height = ORIGINAL_HEIGHT + 'px';
        iframeElement.style.transform = 'scale(' + scale + ')';
        iframeElement.style.transformOrigin = 'center';
    }

    //2. 파일 존재 여부를 확인하는 비동기 함수
    function checkFileExists(url, callback) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                callback(xhr.status === 200);
            }
        };
        xhr.open('HEAD', url);
        xhr.send();
    }

    //3. 파일 존재 여부 확인 및 콘텐츠 삽입
    checkFileExists(gameIframeSrc, function(exists) {
        if (exists) {
            //파일이 존재하면 iFrame 생성 후 보여주기
            const iframe = document.createElement('iframe');
            iframe.id = 'unity-game-iframe';
            iframe.src = gameIframeSrc;
            
            //iframe 크기는 원본 해상도로 설정 (CSS transform을 위한 기반 크기)
            iframe.style.width = ORIGINAL_WIDTH + 'px';
            iframe.style.height = ORIGINAL_HEIGHT + 'px';
            iframe.style.border = "none";
            iframe.style.display = 'block';

            //GPU 레이어 강제 할당 및 렌더링 최적화 힌트
            iframe.style.willChange = 'transform'; 
            iframe.style.backfaceVisibility = 'hidden';
            iframe.style.transformStyle = 'preserve-3d';
            
            iframe.setAttribute('allowfullscreen', '');
            // allow fullscreen and autoplay inside the iframe for modern browsers
            iframe.setAttribute('allow', 'fullscreen; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            // some browsers/platforms expect the camelCase property
            iframe.allowFullscreen = true;
            iframe.setAttribute('scrolling', 'no');
            iframe.style.border = "none";
            iframe.style.display = 'block';
            
            placeholder.appendChild(iframe);

            //[추가]배경 제어 이벤트 리스너
            iframe.addEventListener('mouseenter', function() {
                if (typeof window.setBackgroundActive === 'function') {
                    window.setBackgroundActive(false);
                }
            });

            iframe.addEventListener('mouseleave', function() {
                if (typeof window.setBackgroundActive === 'function') {
                    window.setBackgroundActive(true);
                }
            });
            
            //iframe 로드 완료 후 스케일 조정 함수 실행
            iframe.onload = function() {
                adjustIframeScale(iframe);
            }; 
            
            window.addEventListener('resize', () => adjustIframeScale(iframe));
        } else {
            displayNotReadyMessage();
        }
    });
    //#endregion
});
