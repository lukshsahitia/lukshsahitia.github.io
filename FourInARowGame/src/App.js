import { useState } from "react";

function Square({ value, onSquareClick }) {
  return (
    <button
      className="square"
      onClick={onSquareClick}
      style={{ backgroundColor: value === "X" ? "red" : value === "O" ? "yellow" : "white" }}
    >
      {value}
    </button>
  );
}

export default function Board() {
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState(Array(42).fill(null)); // 6 rows * 7 columns = 42
  const [winner, setWinner] = useState(null);
  const [isTie, setIsTie] = useState(false);
  const numRows = 6;
  const numCols = 7;

  function handleClick(col) {
    if (winner || isTie) return;

    const nextSquares = squares.slice();
    for (let row = numRows - 1; row >= 0; row--) {
      const index = row * numCols + col;
      if (!nextSquares[index]) {
        nextSquares[index] = xIsNext ? "X" : "O";
        setSquares(nextSquares);
        setXIsNext(!xIsNext);
        if (calculateWinner(nextSquares, row, col)) {
          setWinner(nextSquares[index]);
        } else if (nextSquares.every(square => square !== null)) {
          setIsTie(true);
        }
        return;
      }
    }
  }

  function calculateWinner(squares, row, col) {
    const directions = [
      { x: 0, y: 1 }, // vertical
      { x: 1, y: 0 }, // horizontal
      { x: 1, y: 1 }, // diagonal down-right
      { x: 1, y: -1 } // diagonal down-left
    ];
    const current = squares[row * numCols + col];
    
    for (let { x, y } of directions) {
      let count = 1;
      
      for (let i = 1; i < 4; i++) {
        const newRow = row + i * y;
        const newCol = col + i * x;
        const newIndex = newRow * numCols + newCol;
        if (newRow < 0 || newRow >= numRows || newCol < 0 || newCol >= numCols || squares[newIndex] !== current) break;
        count++;
      }
      
      for (let i = 1; i < 4; i++) {
        const newRow = row - i * y;
        const newCol = col - i * x;
        const newIndex = newRow * numCols + newCol;
        if (newRow < 0 || newRow >= numRows || newCol < 0 || newCol >= numCols || squares[newIndex] !== current) break;
        count++;
      }

      if (count >= 4) return true;
    }

    return false;
  }

  const status = winner ? "Winner: " + winner : isTie ? "It's a Tie!" : "Next Player: " + (xIsNext ? "X" : "O");

  return (
    <>
      <div className="status">{status}</div>
      {[...Array(numRows)].map((_, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {[...Array(numCols)].map((_, colIndex) => (
            <Square
              key={colIndex}
              value={squares[rowIndex * numCols + colIndex]}
              onSquareClick={() => handleClick(colIndex)}
            />
          ))}
        </div>
      ))}
    </>
  );
}
