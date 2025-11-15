document.addEventListener('DOMContentLoaded', function() {
    //1. 게임 파일 경로 설정
    const gameIframeSrc = './Unity/index.html';
    const placeholder = document.getElementById('gamePlace');
    
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
    }

    //2. 파일 존재 여부를 확인하는 비동기 함수 (기존과 동일)
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
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            
            iframe.setAttribute('allowfullscreen', '');
            iframe.style.border = "none";
            
            placeholder.appendChild(iframe);
            
            //iframe 로드 완료 후 스케일 조정 함수 실행
            iframe.onload = function() {
                adjustIframeScale(iframe);
            }; 
            
            window.addEventListener('resize', () => adjustIframeScale(iframe));
        } else {
            //파일이 없으면 '준비 중' 메시지 표시
            const message = document.createElement('h1');
            message.textContent = "아직 준비중입니다 ㅠㅠ";
            message.style.color = "white";
            placeholder.appendChild(message);
        }
    });
});