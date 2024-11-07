import React, { CSSProperties, FC, memo, RefObject, useEffect, useState } from 'react';
import TabTitle from '@/components/TabTitle';
import { Recipes } from '@/game/recipes';
import { FixedSizeList } from 'react-window';
import { RecipeCard } from '@/components/RecipeCard';

interface RecipesProps {
  viewBoxRef: RefObject<HTMLDivElement>;
}

export const RecipesComponent: FC<RecipesProps> = ({ viewBoxRef }) => {
  const [listHeight, setListHeight] = useState<number>(
    viewBoxRef.current?.getBoundingClientRect().height ?? 0
  );
  const [listWidth, setListWidth] = useState<number>(
    viewBoxRef.current?.getBoundingClientRect().width ?? 0
  );
  const MemoizedRecipeCard = memo(RecipeCard);

  useEffect(() => {
    const handleResize = () => {
      const viewBoxBound = viewBoxRef.current?.getBoundingClientRect();
      const viewBoxHeight = viewBoxBound?.height ?? 0;
      const viewBoxWidth = viewBoxBound?.width ?? 0;
      setListHeight(viewBoxHeight);
      setListWidth(viewBoxWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial height

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [viewBoxRef]);

  const recipesArray = Object.entries(Recipes);

  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <MemoizedRecipeCard recipeKey={recipesArray[index][0]} recipe={recipesArray[index][1]} />
    </div>
  );

  return (
    <>
      <TabTitle>Common Actions</TabTitle>
      <FixedSizeList
        height={listHeight}
        width={listWidth}
        itemCount={recipesArray.length}
        itemSize={20}
        style={{ width: '100%' }}
      >
        {Row}
      </FixedSizeList>
    </>
  );
};
