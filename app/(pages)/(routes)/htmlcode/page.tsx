"use client";
import { ChangeEvent, useEffect, useRef, useState, KeyboardEvent, ElementRef } from 'react';
import { useDropzone } from 'react-dropzone';

import { ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";

const MIN_RECT_SIZE = 20;

interface Rectangle {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  url?: string;
  target?: '_self' | '_blank';
}

const HtmlCodePage = () => {
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
            // 새로운 너비와 높이 계산
            const newWidth = mouseX - r.startX;
            const newHeight = mouseY - r.startY;
            
            // 시작점과 끝점 재조정
            const startX = newWidth >= 0 ? r.startX : r.startX + newWidth;
            const startY = newHeight >= 0 ? r.startY : r.startY + newHeight;
            const endX = newWidth >= 0 ? r.startX + newWidth : r.startX;
            const endY = newHeight >= 0 ? r.startY + newHeight : r.startY;

            // 최소 크기 조건 추가
            const width = Math.abs(endX - startX);
            const height = Math.abs(endY - startY);
            if (width < MIN_RECT_SIZE || height < MIN_RECT_SIZE) {
              // 최소 크기 미달 시 조정하지 않음
              return r;
            }

            return { ...r, startX, startY, endX, endY };
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
            const startX = Math.max(0, Math.min(mouseX, imageSize.width));
            const startY = Math.max(0, Math.min(mouseY, imageSize.height));
            let newEndX = startX + (r.endX - r.startX);
            let newEndY = startY + (r.endY - r.startY);

            // 이미지의 너비와 높이를 넘어가지 않도록 조정
            newEndX = Math.min(newEndX, imageSize.width);
            newEndY = Math.min(newEndY, imageSize.height);

            // 사각형의 최소 크기를 유지하기 위해 startX, startY 조정
            const newStartX = Math.max(0, newEndX - (r.endX - r.startX));
            const newStartY = Math.max(0, newEndY - (r.endY - r.startY));
            return {...r, startX: newStartX, startY: newStartY, endX: newEndX, endY: newEndY};
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
  }, [resizingRect, draggingRect, setRectangles, imageSize.width, imageSize.height]);

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
      const rect = containerRef.current!.getBoundingClientRect();
      const endX = Math.max(0, Math.min(moveEvent.clientX - rect.left, imageSize.width));
      const endY = Math.max(0, Math.min(moveEvent.clientY - rect.top, imageSize.height));

      const newStartX = startX >= endX ? endX : startX;
      const newEndX = startX >= endX ? startX : endX;
      const newStartY = startY >= endY ? endY : startY;
      const newEndY = startY >= endY ? startY : endY;

      // 실시간으로 사각형 영역 업데이트
      setCurrentRect(prevRect => ({ ...prevRect!, startX: newStartX, startY: newStartY, endX: newEndX, endY: newEndY }));
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
    // 새로운 사각형 생성
    if (currentRect) {
      if (Math.abs(currentRect.endX - currentRect.startX) >= MIN_RECT_SIZE && Math.abs(currentRect.endY - currentRect.startY) >= MIN_RECT_SIZE) {
        setRectangles([...rectangles, currentRect]);
      } else {
        // 사각형이 너무 작을 때는 강제로 늘려준다
        const resizeRect = { startX: currentRect.startX, startY: currentRect.startY, endX: currentRect.startX + MIN_RECT_SIZE, endY: currentRect.endY + MIN_RECT_SIZE };
        setRectangles([...rectangles, resizeRect]);
      }
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

  // 키보드 입력 이벤트 핸들러
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Delete' && selectedRectIndex !== null) {
      // Delete 키 입력 시 선택된 사각형 삭제
      handleDelete();
    }
  };

  const handleDelete = () => {
    const newRectangles = rectangles.filter((_, index) => index !== selectedRectIndex);
    setRectangles(newRectangles);
    setSelectedRectIndex(null);
  };

  // 입력값 변경 핸들러
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    // URL 형식인지 검사하는 정규식
    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    if (selectedRectIndex !== null) {
      setRectangles(prevRectangles =>
        prevRectangles.map((rect, index) =>
          index === selectedRectIndex ? { ...rect, url: inputUrl } : rect
        )
      );
    }
  };

  const handleInputUrlBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    // URL 형식인지 검사하는 정규식
    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    // if (selectedRectIndex !== null) {
      if (!urlRegex.test(inputUrl)) {
        alert('유효한 URL을 입력하세요.');
        return;
      }

      setRectangles(prevRectangles =>
        prevRectangles.map((rect, index) =>
          index === selectedRectIndex ? { ...rect, url: inputUrl } : rect
        )
      );
    // }
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
    // Validation
    if (rectangles.length === 0) {
      alert('추가된 사각형이 없습니다.');
      return;
    }

    const hasEmptyUrl = rectangles.some((rect) => !rect.url);
    if (hasEmptyUrl) {
      alert('각각의 사각형에 URL을 입력해주세요.');
      return;
    }

    let htmlContent = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Image Map</title>
      </head>
      <body>
        <img src="${imageSrc}" alt="Image" usemap="#imageMap" />
        <map name="imageMap">
    `;

    rectangles.forEach((rect) => {
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

  const generateHTMLCodeMobile = () => {
    // Validation
    if (rectangles.length === 0) {
      alert('추가된 사각형이 없습니다.');
      return;
    }

    const hasEmptyUrl = rectangles.some((rect) => !rect.url);
    if (hasEmptyUrl) {
      alert('각각의 사각형에 URL을 입력해주세요.');
      return;
    }

    let htmlContent = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Image Map</title>
        <style>
          body {
            padding: 0;
            margin: 0;
          }
          .image-container {
            width: 100%;
            max-width: 640px;
            display: block;
            position: relative;
          }
          .image-container img {
            display: block;
            width: 100%;
            height: auto;
          }
          .areas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
          .area {
            position: absolute;
            cursor: pointer;
            display: none;
          }
        </style>
      </head>
      <body>
        <div class="image-container">
          <img src="${imageSrc}" alt="Image" />
          <div class="areas">
    `;

    rectangles.forEach((rect, index) => {
      htmlContent += `<a
        key=${index}
        href="${rect.url}"
        target="${rect.target || '_self'}"
        style="
          position: absolute;
          left: ${(rect.startX / imageSize.width) * 100}%;
          top: ${(rect.startY / imageSize.height) * 100}%;
          width: ${((rect.endX - rect.startX) / imageSize.width) * 100}%;
          height: ${((rect.endY - rect.startY) / imageSize.height) * 100}%;"
      ></a>\n`;
    });

    htmlContent += `
          </div>
        </div>
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
    // 이미지의 최대 크기를 100%로 설정
    // const responsiveHtmlContent = htmlContent.replace('<img', '<img style="max-width: 100%;"');

    // // 사각 영역을 모바일의 반응형으로 링크로 만들기
    // const responsiveRectangles = rectangles.map((rect) => {
    //   const startXPercent = (rect.startX / imageSize.width) * 100;
    //   const startYPercent = (rect.startY / imageSize.height) * 100;
    //   const endXPercent = (rect.endX / imageSize.width) * 100;
    //   const endYPercent = (rect.endY / imageSize.height) * 100;

    //   return {
    //     ...rect,
    //     startX: startXPercent + '%',
    //     startY: startYPercent + '%',
    //     endX: endXPercent + '%',
    //     endY: endYPercent + '%',
    //   };
    // });

    // // 수정된 좌표로 HTML 코드 업데이트
    // let responsiveHtmlCode = responsiveHtmlContent;
    // responsiveRectangles.forEach((rect) => {
    //   responsiveHtmlCode = responsiveHtmlCode.replace(
    //     `coords="${rect.startX},${rect.startY},${rect.endX},${rect.endY}"`,
    //     `coords="${rect.startX}%,${rect.startY}%,${rect.endX}%,${rect.endY}%"`
    //   );
    // });

    // return responsiveHtmlCode;
  };

  const onDrop = (uploadFile: File[]) => {
    const file = uploadFile[0];
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

  const handleTitle = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const sidebarRef = useRef<ElementRef<"aside">>(null);


  return (
    <div className="relative flex flex-col items-center" onMouseUp={handleMouseUp}>
      {!imageSrc && (
        <div className='w-full flex justify-center items-center' style={{ height: 'calc(100vh - 4rem)' }}>
          <div
            {...getRootProps()}
            className='p-5 text-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer mb-5 h-44 flex flex-col justify-center items-center'
          >
            <Input accept="image/*" type="file" {...getInputProps()} />
            <ImagePlus className="w-10 h-10 text-gray-500" />
            <p className="text-gray-500">이미지를 드래그 앤 드랍 또는 클릭 하세요.</p>
          </div>
        </div>
      )}
      {imageSrc && (
        <>
          <div className="py-3" style={{ width: `${imageSize.width}px` }}>
            <Input id="title" onChange={handleTitle} placeholder="제목" />
          </div>
          <div
            ref={containerRef}
            style={{ width: `${imageSize.width}px`, height: `${imageSize.height}px` }}
            className="relative bg-gray-200 cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
          <div
            // src={imageSrc}
            // alt="Uploaded"
            style={{ background: `url(${imageSrc})` }}
            className="absolute top-0 left-0 w-full h-full"
            draggable="false"
          ></div>
            {rectangles.map((rect, index) => (
              <div
                key={index}
                className={`absolute border-2 ${
                  selectedRectIndex === index ? 'border-red-500 bg-red-400 cursor-move' : 'border-green-900 bg-green-400 cursor-pointer'
                } bg-opacity-50 flex items-center justify-center`}
                style={{
                  left: `${Math.min(rect.startX, rect.endX)}px`,
                  top: `${Math.min(rect.startY, rect.endY)}px`,
                  width: `${Math.abs(rect.endX - rect.startX)}px`,
                  height: `${Math.abs(rect.endY - rect.startY)}px`,
                }}
              >
                {/* 선택된 사각형에만 크기 조절 핸들을 표시 */}
                {selectedRectIndex === index ? (
                  <div
                    className="absolute cursor-se-resize bg-red-500"
                    style={{ width: '10px', height: '10px', right: '-5px', bottom: '-5px' }}
                    onMouseDown={(e) => {
                      // 크기 조절 로직 시작
                      e.stopPropagation(); // 사각형 드래그 이벤트 방지
                      setResizingRect({ index, startX: e.clientX, startY: e.clientY });
                    }}
                  ></div>
                ) : (
                  <span className="px-2 py-1 font-semibold text-sm bg-amber-100 text-black rounded-full">{index + 1}</span>
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
        </>
      )}
      {/* 하단 입력 영역 */}
      {selectedRectIndex !== null && (
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-gray-900 flex flex-col gap-3 z-[80]">
          <div className="flex text-white items-center">
            <span className="w-20">링크경로</span>
            <input
              type="text"
              placeholder="URL"
              value={rectangles[selectedRectIndex]?.url || ''}
              onChange={handleInputChange}
              onBlur={handleInputUrlBlur}
              className="w-full border p-1 text-black"
            />
          </div>
          <div className="text-white flex flex-row gap-3 items-center">
            <span className="w-20">링크타겟</span>
            <label>
              <input
                type="radio"
                value="_self"
                checked={rectangles[selectedRectIndex]?.target === '_self'}
                onChange={handleRadioChange}
                className="mr-1"
              />
              현재 창
            </label>
            <label>
              <input
                type="radio"
                value="_blank"
                checked={rectangles[selectedRectIndex]?.target === '_blank'}
                onChange={handleRadioChange}
                className="mr-1"
              />
              새 창
            </label>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {/* HTML 코드 생성 버튼 */}
      {(selectedRectIndex === null && rectangles.length > 0) && (
        <>
          <aside
            ref={sidebarRef}
            className={cn(
              "fixed h-full bg-gray-300 overflow-y-auto flex w-60 flex-col z-[80] right-0 p-3",
            )}
          >
            {/* <Input  accept="image/*" type="file" onChange={handleImageChange} /> */}
            <div className="flex flex-col gap-2">
              {rectangles.map((item, index) => (
                <Button
                key={index}
                  variant={!item.url ? 'destructive' : 'outline'}
                  onClick={() => {
                    setSelectedRectIndex(index)
                    if (!rectangles[index].target) {
                      // target 값이 없는 경우에만 '_self'로 설정
                      setRectangles(prevRectangles => {
                        const updatedRectangles = [...prevRectangles];
                        updatedRectangles[index].target = '_self';
                        return updatedRectangles;
                      });
                    }
                  }}
                >
                  {index+1}. url: {!item.url ? '미입력' : '입력완료'}
                </Button>
              ))}
            </div>
          </aside>
          <button
            onClick={generateHTMLCode}
            className="fixed top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded z-[81]"
          >
            PC
          </button>
          <button
            onClick={generateHTMLCodeMobile}
            className="fixed top-4 right-20 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            style={{ zIndex: 80 }}
          >
            모바일
          </button>
        </>
      )}
    </div>
  );
};

export default HtmlCodePage;
