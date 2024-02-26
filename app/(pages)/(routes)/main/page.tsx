"use client";
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

interface Rectangle {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  url?: string;
  target?: '_self' | '_blank';
}

const MainPage = () => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [currentRect, setCurrentRect] = useState<Rectangle | null>(null);

  // 드래그 상태 및 선택된 사각형의 인덱스를 저장하기 위한 상태 추가
  const [draggingRect, setDraggingRect] = useState<{index: number, offsetX: number, offsetY: number} | null>(null);
  const [selectedRectIndex, setSelectedRectIndex] = useState<number | null>(null);

  // 사각형 크기 조절 상태
  const [resizingRect, setResizingRect] = useState<{index: number, startX: number, startY: number} | null>(null);

  // 추가한 입력 상태
  const [inputUrl, setInputUrl] = useState<string>('');
  const [inputTarget, setInputTarget] = useState<'_self' | '_blank'>('_self');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingRect !== null) {
        // 크기 조절 중인 경우
        const rect = containerRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // 사각형 크기 조절 로직
        setRectangles(currentRectangles => currentRectangles.map((r, index) => {
          if (index === resizingRect.index) {
            const newWidth = mouseX - r.startX;
            const newHeight = mouseY - r.startY;
            return {...r, endX: r.startX + newWidth, endY: r.startY + newHeight};
          }
          return r;
        }));
      } else if (draggingRect !== null) {
        // 드래그 중인 경우
        const rect = containerRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - draggingRect.offsetX;
        const mouseY = e.clientY - rect.top - draggingRect.offsetY;
        
        // 선택된 사각형 이동 로직
        setRectangles(currentRectangles => currentRectangles.map((r, index) => {
          if (index === draggingRect.index) {
            return {...r, startX: mouseX, startY: mouseY, endX: mouseX + (r.endX - r.startX), endY: mouseY + (r.endY - r.startY)};
          }
          return r;
        }));
      }
    };

    const handleMouseUp = () => {
      if (resizingRect) {
        setResizingRect(null); // 크기 조절 종료
      } else if (draggingRect) {
        setDraggingRect(null); // 드래그 종료
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingRect, draggingRect, setRectangles]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!imageSrc) return;

    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // 클릭된 위치가 사각형 내부인지 확인하고, 해당 사각형을 드래그하기 위한 준비
    const clickedRectIndex = rectangles.findIndex(r =>
      mouseX >= r.startX && mouseX <= r.endX && mouseY >= r.startY && mouseY <= r.endY
    );

    if (clickedRectIndex !== -1) {
      setSelectedRectIndex(clickedRectIndex);
      if (!rectangles[clickedRectIndex].target) {
        // target 값이 없는 경우에만 '_self'로 설정
        setRectangles(prevRectangles => {
          const updatedRectangles = [...prevRectangles];
          updatedRectangles[clickedRectIndex].target = '_self';
          return updatedRectangles;
        });
      }
      // 드래그할 사각형이 선택된 경우, 드래그 시작 위치를 기록
      setDraggingRect({
        index: clickedRectIndex,
        offsetX: mouseX - rectangles[clickedRectIndex].startX,
        offsetY: mouseY - rectangles[clickedRectIndex].startY
      });
      // 드래그 이벤트 리스너 추가 (선택적으로 여기서 추가하거나, useEffect 내에 추가)
    } else {
      if (selectedRectIndex !== null) {
        setSelectedRectIndex(null);
        return;
      }
      // 새 사각형 그리기 로직
      // 컨테이너의 경계를 기준으로 한 마우스의 상대적 위치 계산
      const rect = containerRef.current!.getBoundingClientRect();
      const startX = event.clientX - rect.left;
      const startY = event.clientY - rect.top;

      setCurrentRect({ startX, startY, endX: startX, endY: startY });

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // 마우스 이동 중 좌표 계산
        const endX = moveEvent.clientX - rect.left;
        const endY = moveEvent.clientY - rect.top;

        // 실시간으로 사각형 영역 업데이트
        setCurrentRect(prevRect => ({ ...prevRect!, endX, endY }));
      };

      const handleMouseUp = () => {
        // 마우스 버튼을 놓았을 때 이벤트 리스너 제거
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      // 이벤트 리스너 추가
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleMouseUp = () => {
    if (currentRect) {
      setRectangles([...rectangles, currentRect]);
      setCurrentRect(null);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const src = readerEvent.target!.result as string;
        setImageSrc(src);
        setRectangles([]); // 이미지를 새로 업로드할 때 사각형 영역 초기화

        const img = new Image();
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  // 입력값 변경 핸들러
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (selectedRectIndex !== null) {
      setRectangles(prevRectangles =>
        prevRectangles.map((rect, index) =>
          index === selectedRectIndex ? { ...rect, url: e.target.value } : rect
        )
      );
    }
  };

  // 라디오 버튼 변경 핸들러
  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (selectedRectIndex !== null) {
      setRectangles(prevRectangles =>
        prevRectangles.map((rect, index) =>
          index === selectedRectIndex ? { ...rect, target: e.target.value as '_self' | '_blank' } : rect
        )
      );
    }
  };

  // HTML 코드 생성 및 파일 다운로드 함수
  const generateHTMLCode = () => {
    if (rectangles.length === 0) {
      alert('추가된 사각형이 없습니다.');
      return;
    }

    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Image Map</title>
      </head>
      <body>
        <img src="${imageSrc}" alt="Image" usemap="#imageMap" />
        <map name="imageMap">
    `;

    rectangles.forEach((rect, index) => {
      const shape = `<area shape="rect" coords="${rect.startX},${rect.startY},${rect.endX},${rect.endY}"`;
      const href = rect.url ? ` href="${rect.url}"` : '';
      const target = rect.target ? ` target="${rect.target}"` : '';
      htmlContent += `${shape}${href}${target} />\n`;
    });

    htmlContent += `
        </map>
      </body>
      </html>
    `;

    // HTML 파일 생성 및 다운로드
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'imageMap.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex flex-col items-center" style={{ paddingBottom: '74px' }}>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <div
        ref={containerRef}
        style={{ width: `${imageSize.width}px`, height: `${imageSize.height}px` }}
        className="relative bg-gray-200"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Uploaded"
            className="absolute top-0 left-0 w-full h-full"
            draggable="false"
          />
        )}
        {rectangles.map((rect, index) => (
          <div
            key={index}
            className={`absolute border-2 ${
              selectedRectIndex === index ? 'border-red-500 bg-red-400' : 'border-green-900 bg-green-400'
            } bg-opacity-50`}
            style={{
              left: `${Math.min(rect.startX, rect.endX)}px`,
              top: `${Math.min(rect.startY, rect.endY)}px`,
              width: `${Math.abs(rect.endX - rect.startX)}px`,
              height: `${Math.abs(rect.endY - rect.startY)}px`,
            }}
          >
            {/* 선택된 사각형에만 크기 조절 핸들을 표시 */}
            {selectedRectIndex === index && (
              <div
                className="absolute cursor-se-resize bg-red-500"
                style={{ width: '10px', height: '10px', right: '-5px', bottom: '-5px' }}
                onMouseDown={(e) => {
                  // 크기 조절 로직 시작
                  e.stopPropagation(); // 사각형 드래그 이벤트 방지
                  setResizingRect({ index, startX: e.clientX, startY: e.clientY });
                }}
              ></div>
            )}
          </div>
        ))}
        {currentRect && (
          <div
            className="absolute border-2 border-blue-900 bg-blue-400 bg-opacity-50"
            style={{
              left: `${Math.min(currentRect.startX, currentRect.endX)}px`,
              top: `${Math.min(currentRect.startY, currentRect.endY)}px`,
              width: `${Math.abs(currentRect.endX - currentRect.startX)}px`,
              height: `${Math.abs(currentRect.endY - currentRect.startY)}px`,
            }}
          ></div>
        )}
      </div>
      {/* 하단 입력 영역 */}
      {selectedRectIndex !== null && (
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-white" style={{ zIndex: 80 }}>
          <input
            type="text"
            placeholder="URL"
            value={rectangles[selectedRectIndex]?.url || ''}
            onChange={handleInputChange}
            className="w-full border p-1"
          />
          <div>
            <label className="mr-2">
              <input
                type="radio"
                value="_self"
                checked={rectangles[selectedRectIndex]?.target === '_self'}
                onChange={handleRadioChange}
                className="mr-1"
              />
              Self
            </label>
            <label>
              <input
                type="radio"
                value="_blank"
                checked={rectangles[selectedRectIndex]?.target === '_blank'}
                onChange={handleRadioChange}
                className="mr-1"
              />
              Blank
            </label>
          </div>
        </div>
      )}
      {/* HTML 코드 생성 버튼 */}
      {(selectedRectIndex === null && rectangles.length > 0) && (
        <button
          onClick={generateHTMLCode}
          className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          style={{ zIndex: 80 }}
        >
          HTML 코드 생성 및 다운로드
        </button>
      )}
    </div>
  );
};

export default MainPage;
