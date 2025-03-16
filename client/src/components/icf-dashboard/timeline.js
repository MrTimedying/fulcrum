import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Test } from "./test";

const Timeline = ({ cards, setCards}) => {
  const [isOpenTest, setIsOpenTest] = useState(false);
  const [tableData, setTableData] = useState([]);



  

/*   const selectionSetter = (item) => {
    setTestSelected(item.name);
    console.log(testSelected);
    setTestEdit(item);
  }; */

  const EditItemHandler = (cards) => {
    console.log(cards);
    setTableData(cards);  
    setIsOpenTest(true);

  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const updatedCards = [...cards];
    const [removed] = updatedCards.splice(result.source.index, 1);
    updatedCards.splice(result.destination.index, 0, removed);

    setCards(updatedCards);
  };

  return (
    <div>
      <Test
        isOpenTest={isOpenTest}
        setIsOpenTest={setIsOpenTest}
        cards={cards}
        setCards={setCards}
        tableData={tableData}
        setTableData={setTableData}
      />
      <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={() => EditItemHandler(cards)}>Edit Timeline</button>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="timeline" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex h-48 bg-zinc-900 p-4 space-x-6"
            >
              {cards.map((card, index) => (
                <Draggable
                  key={card.name}
                  draggableId={card.name}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={` p-2 mb-2 w-48 rounded font-mono text-slate-300 bg-zinc-800`}
                      
                    >
                      <div>
                        <strong>Name:</strong> {card.name}
                      </div>
                      <div>
                        <strong>Type:</strong> {card.type}
                      </div>
                      <div>
                        <strong>Score:</strong> {card.score}
                      </div>
                      <div>
                        <strong>Date:</strong> {card.date}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Timeline;
