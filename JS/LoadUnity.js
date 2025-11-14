document.addEventListener('DOMContentLoaded', function() {
    //1. 게임 파일 경로 설정
    const gameIframeSrc = './Unity/index.html';
    const placeholder = document.getElementById('gamePlace');

    //2. 파일 존재 여부를 확인하는 비동기 함수 (HTTP 요청 사용)
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
            iframe.src = gameIframeSrc;
            iframe.width = "1920";   
            iframe.height = "1080";
            iframe.setAttribute('allowfullscreen', '');
            iframe.style.border = "none";

            placeholder.appendChild(iframe);
        } else {
            //파일이 없으면 '준비 중' 메시지 표시
            const message = document.createElement('h1');
            message.textContent = "아직 준비중입니다 ㅠㅠ";
            message.style.color = "white";
            placeholder.appendChild(message);
        }
    });
});