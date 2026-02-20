document.addEventListener('DOMContentLoaded', function() {
    const placeholder = document.getElementById('gamePlace');
      
    //#region Mobile
    //1. 모바일 기기 판별 함수
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    //2. 메시지 표시 함수
    function displayMobileMessage() {
        const message = document.createElement('div'); // div로 변경
        message.className = 'mobile-warning-message';
        message.style.color = '#FFEB99';
        message.innerHTML = `
            <h2>화면 최적화 안내</h2>
            <p>본 포트폴리오는 PC 환경(데스크톱/노트북)에 최적화되어 있습니다.</p>
            <p>모바일 환경에서 내용을 확인하시려면, 아래 노션을 이용해 주세요.</p>
            <div class="link-container">
                <a href="https://www.notion.so/d553e45114e04fd69fde4ed56d8afe6b?source=copy_link" target="_blank" class="notion-link">
                    🔗 포트폴리오 노션 페이지
                </a>
            </div>
        `;
        placeholder.appendChild(message);
    }
    
    if (isMobileDevice()) {
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
            
            iframe.setAttribute('allowfullscreen', '');
            // allow fullscreen and autoplay inside the iframe for modern browsers
            iframe.setAttribute('allow', 'fullscreen; autoplay; clipboard-write');
            // some browsers/platforms expect the camelCase property
            iframe.allowFullscreen = true;
            iframe.setAttribute('scrolling', 'no');
            iframe.style.border = "none";
            iframe.style.display = 'block';
            
            placeholder.appendChild(iframe);
            
            //iframe 로드 완료 후 스케일 조정 함수 실행
            iframe.onload = function() {
                adjustIframeScale(iframe);
            }; 
            
            window.addEventListener('resize', () => adjustIframeScale(iframe));
        } else {
            //파일이 없으면 '준비 중' 메시지 표시
            const message = document.createElement('h1');
            message.style.color = '#FFEB99';
            message.textContent = "아직 준비중입니다 ㅠㅠ";
            placeholder.appendChild(message);
        }
    });
    //#endregion
});