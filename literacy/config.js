/* 설정.
   commentary: 해설서 장별 주소의 공통 규칙. 본문과 다르게 읽은 분에게 '해설서 N장 읽기' 단추가 나옵니다.
     주소의 장 번호 자리에 {N}(1, 2, 3…) 또는 {NN}(01, 02, 03…)을 넣습니다. 규칙과 다른 장은 commentaryByChapter 에 '장번호: 주소'로 적습니다.
   gradeUrl: AI 채점 전달 서버 주소. 비워 두면 AI를 쓰지 않고 낱말로만 채점합니다.
     주소를 적으면 모든 답을 AI가 채점하고, 서버에 연결하지 못할 때만 낱말 채점으로 돌아갑니다. */
window.LIT_CONFIG = {
  commentary: 'https://jeonsd.github.io/isaiah/isaiah_{NN}.html',
  commentaryByChapter: {
    1: 'https://jeonsd.github.io/isaiah/ISAYAgide.html'
  },
  gradeUrl: 'https://isaiah-grader.aomori1191.workers.dev/'
};
