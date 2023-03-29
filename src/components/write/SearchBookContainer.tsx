import Image from "next/image";
import { useMemo } from "react";
import { RadioGroup } from "@headlessui/react";

import ContainerTitle from "./ContainerTitle";
import SearchBookItem from "./SearchBookItem";

import type { BookInfo } from "@/constants/types";
import useIntersect from "@/hooks/common/useIntersect";
import useGetSearchBook from "@/hooks/write/useGetSearchBook";
import NotFoundSearchImage from "@/static/images/not_found_search.svg";
import { useWriteActions } from "@/store/useWriteStore";

interface Props {
  query: string;
  onChange: (value: BookInfo) => void;
  handleClose: () => void;
}

const SearchBookContainer = ({ query, onChange, handleClose }: Props) => {
  const { postData } = useWriteActions();
  const handleClickButton = () => {
    postData("title", query);
    handleClose();
  };

  const { data, hasNextPage, isFetching, fetchNextPage } = useGetSearchBook(query);
  const contents = useMemo(() => (data ? data.pages.flatMap((page) => page.data) : []), [data]);
  const ref = useIntersect(async (entry, observer) => {
    observer.unobserve(entry.target);
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  return (
    <>
      {!isFetching && contents.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-6">
          <span className="text-[#6a6a6a]">검색 결과가 없습니다🥲</span>
          <Image
            className="mt-[14px]"
            src={NotFoundSearchImage}
            alt="검색 결과 없음 이미지"
            width={178}
            height={113}
          />
          <button
            onClick={handleClickButton}
            className="mt-[40px] h-[60px] w-full rounded-[10px] bg-[#ececec] font-medium"
          >
            책 이름 <span className="font-extrabold">직접 입력하기</span>
          </button>
        </div>
      ) : (
        <>
          <ContainerTitle title="검색 결과" />

          <RadioGroup onChange={onChange} className="h-full overflow-y-auto px-6 pb-[30px]">
            {contents.map((item, idx) => (
              <SearchBookItem key={idx} item={item} />
            ))}
            {hasNextPage && <div ref={ref} />}
          </RadioGroup>
        </>
      )}
    </>
  );
};

export default SearchBookContainer;
