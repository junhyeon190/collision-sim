import { useStore } from '../../../store/useStore';

export default function Screen1Bottom() {
  const screen1 = useStore((state) => state.screen1);
  const updateScreen1 = useStore((state) => state.updateScreen1);
  const feedbackUnlocked = useStore((state) => state.feedbackUnlocked);

  const isCorrect = screen1.interpretationAnswer === 3;

  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 h-full">
      
      {/* 왼쪽: 해석 질문 */}
      <div className="flex-1 bg-blue-50/50 p-4 border border-blue-100 rounded-lg shadow-sm">
        <h4 className="font-bold text-blue-800 mb-3 flex items-center">
          <span className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-sm">?</span>
          관찰 후 해석: 수레가 등속 직선 운동을 하는 구간에서, 수레에 작용하는 알짜힘(합력)은 얼마인가?
        </h4>
        <div className="space-y-2 text-gray-700">
          {[
            { id: 1, text: "미는 힘이 남아있어서 알짜힘 > 0 이다." },
            { id: 2, text: "공기 저항 때문에 알짜힘 < 0 이다." },
            { id: 3, text: "밀어주는 힘과 마찰력 모두 없으므로 알짜힘 = 0 이다." },
            { id: 4, text: "알 수 없다." }
          ].map(opt => (
            <label 
              key={opt.id} 
              onClick={(e) => {
                e.preventDefault();
                updateScreen1({ interpretationAnswer: opt.id });
              }}
              className={`flex items-start space-x-2 p-2 rounded border cursor-pointer transition-colors
                ${screen1.interpretationAnswer === opt.id ? 'bg-white border-blue-400 ring-1 ring-blue-400' : 'border-transparent'}`}
            >
              <input 
                type="radio" 
                name="interpretationAnswer"
                className="mt-1 w-4 h-4 text-blue-600"
                checked={screen1.interpretationAnswer === opt.id}
                readOnly
              />
              <span>{opt.text}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 오른쪽: 자동 피드백 */}
      <div className="flex-1 relative bg-gray-50 border rounded-lg p-4 shadow-sm flex flex-col">
        {!feedbackUnlocked ? (
          <div className="absolute inset-0 bg-gray-200/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg border border-gray-300">
            <svg className="w-10 h-10 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="font-bold text-gray-700">교사 확인 대기 중</p>
            <p className="text-sm text-gray-500 mt-1">선생님이 화면을 열어주시면 해설이 보입니다.</p>
          </div>
        ) : null}

        <h4 className="font-bold text-gray-800 mb-3 flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          해설 및 피드백
        </h4>
        
        {screen1.interpretationAnswer ? (
          isCorrect ? (
            <div className="text-gray-700 space-y-2">
              <p className="font-bold text-green-700">정답입니다! 🎉</p>
              <p>갈릴레이와 뉴턴이 밝혀낸 관성의 법칙(제1법칙)입니다. 물체에 작용하는 <strong>알짜힘이 0이면</strong>, 움직이던 물체는 <strong>원래 속도 그대로 등속 직선 운동</strong>을 계속합니다.</p>
              <p className="text-sm bg-blue-100 p-2 rounded text-blue-900 mt-2">
                💡 팁: 오른쪽 위 마찰 슬라이더가 열렸습니다! 실제 교실처럼 마찰이 있다면 수레는 어떻게 될까요?
              </p>
            </div>
          ) : (
            <div className="text-gray-700 space-y-2">
              <p className="font-bold text-red-600">아쉽네요, 다시 생각해 볼까요?</p>
              <p>우리는 일상에서 '힘을 주지 않으면 물체가 멈춘다'고 경험합니다. 하지만 이는 물체 안에 힘이 떨어져서가 아니라, <strong>바닥의 마찰력(방해하는 힘)</strong>이 존재하기 때문입니다.</p>
              <p>마찰이 전혀 없다면, <strong>힘이 없어도 물체는 영원히 같은 속도로 움직입니다.</strong> (관성)</p>
            </div>
          )
        ) : (
          <div className="text-gray-500 italic h-full flex items-center justify-center text-sm">
            왼쪽의 해석 질문에 먼저 답해 보세요.
          </div>
        )}
      </div>
      
    </div>
  );
}
