'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;
      if (!puzzle || !coordinate || !value ) {
        res.json({ error: "Required field(s) missing" });
        return;
      }

      if (!solver.checkLength(puzzle)) {
        res.json({ error: 'Expected puzzle to be 81 characters long' });
        return;
      }
      if (!solver.checkCharacters(puzzle)) {
        res.json({ error: 'Invalid characters in puzzle' });
        return;
      }

      let validCoordinate = solver.checkCoordinate(coordinate);
      let validValue = solver.checkValue(value);

      if (!validCoordinate) {
        res.json({ error: 'Invalid coordinate' });
        return;
      }
      if (!validValue) {
        res.json({ error: 'Invalid value' });
        return;
      }

      const row = coordinate.split('')[0];
      const column = coordinate.split('')[1];
      let validRow = solver.checkRowPlacement(puzzle, row, column, value);
      let validCol = solver.checkColPlacement(puzzle, row, column, value);
      let validReg = solver.checkRegionPlacement(puzzle, row, column, value);
      let conflicts = [];

      if (validRow && validCol && validReg) {
        res.json({ valid: true });
      } else {
        if (!validRow) {
          conflicts.push("row");
        }
        if (!validCol) {
          conflicts.push("column");
        }
        if (!validReg) {
          conflicts.push("region");
        }
      res.json({ valid: false, conflict: conflicts });
      }
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;
      console.log("Puzzle :>>", puzzle);
      if  (!puzzle) {
        return res.json({ error: "Required field missing" });
      } else if (puzzle.length != 81) {
        return res.json({ error: "Expected puzzle to be 81 characters long" });
      }else if (/[^0-9.]/gi.test(puzzle)) {
        return res.json ({ error: 'Invalid characters in puzzle' });
      }

      let solvedString = solver.solve(puzzle);
      console.log("solvedString :>>", solvedString);

      if (solvedString) {
        return res.json({ solution: solvedString });
      } 
      return res.json({ error: "Puzzle cannot be solved" });
    });
};
