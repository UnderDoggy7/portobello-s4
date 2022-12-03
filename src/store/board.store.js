import { boardService } from "../services/board.service.js";

export const boardStore = {
  state: {
    boards: [],
    currBoard: null,
    currTask: null,
  },
  getters: {
    boards({ boards }) {
      return boards;
    },
    currBoard({ currBoard }) {
      return currBoard;
    },
  },
  mutations: {
    setBoards(state, { boards }) {
      state.boards = boards;
    },
    addBoard(state, { board }) {
      state.boards.push(board);
      state.currBoard = board;
    },
    updateBoard(state, { board }) {
      const idx = state.boards.findIndex((c) => c._id === board._id);
      state.boards.splice(idx, 1, board);
      state.currBoard = board;
    },
    removeBoard(state, { boardId }) {
      state.boards = state.boards.filter((board) => board._id !== boardId);
    },
    addBoardMsg(state, { boardId, msg }) {
      const board = state.boards.find((board) => board._id === boardId);
      if (!board.msgs) board.msgs = [];
      board.msgs.push(msg);
    },
    setCurrBoard(state, newBoard) {
      const { board, filteredBoard } = newBoard;
      state.currBoard = board ? board : filteredBoard;
    },
    setTask(state, { task }) {
      state.currTask = task;
    },
  },
  actions: {
    async addBoard(context, { board }) {
      try {
        board = await boardService.save(board);
        context.commit({ type: "addBoard", board });
        // context.commit("setCurrBoard", board)
        return board;
      } catch (err) {
        console.log("boardStore: Error in addBoard", err);
        throw err;
      }
    },
    async createNewBoard(context, { board }) {
      try {
        const newBoard = await boardService.getEmptyBoard();
        newBoard.title = board.title
        newBoard.style = {
          "bgColor": board.style.bgColor,
          "imgUrl": board.style.imgUrl,
        },
        board = await boardService.save(newBoard);
        context.commit({ type: "addBoard", board });
        context.commit({type:"setCurrBoard", board})
        return board;
      } catch (err) {
        console.log("boardStore: Error in addBoard", err);
        throw err;
      }
    },
    async updateBoard(context, { board }) {
      try {
        board = await boardService.save(board);
        context.commit({ type: "updateBoard", board });
        // context.commit("setCurrBoard", board)
        return board;
      } catch (err) {
        console.log("boardStore: Error in updateBoard", err);
        throw err;
      }
    },
    async loadBoards(context, filterBy) {
      try {
        const boards = await boardService.query();
        context.commit({ type: "setBoards", boards });
      } catch (err) {
        console.log("boardStore: Error in loadBoards", err);
        throw err;
      }
    },
    async removeBoard(context, { boardId }) {
      try {
        await boardService.remove(boardId);
        context.commit({ type: "removeBoard", boardId });
      } catch (err) {
        console.log("boardStore: Error in removeBoard", err);
        throw err;
      }
    },
    async addBoardMsg(context, { boardId, txt }) {
      try {
        const msg = await boardService.addBoardMsg(boardId, txt);
        context.commit({ type: "addBoardMsg", boardId, msg });
      } catch (err) {
        console.log("boardStore: Error in addBoardMsg", err);
        throw err;
      }
    },
    async setCurrBoard({ commit }, { boardId, filterBy }) {
      try {
        const board = await boardService.getById(boardId);
        if (filterBy) {
          const { txt } = filterBy;
          const regex = new RegExp(txt, "i");
          const filteredGroups = board.groups.filter((group) =>
            regex.test(group.title)
          );
          console.log(filteredGroups);
          const filteredBoard = { ...board, groups: filteredGroups };
          console.log(filteredBoard);
          commit({ type: "setCurrBoard", filteredBoard });
        } else commit({ type: "setCurrBoard", board });
        return board;
      } catch (err) {
        console.log("boardStore: Error in setCurrBoard", err);
        throw err;
      }
    },
    async loadTask({ commit }, { board, taskId }) {
      try {
        const task = await boardService.getTaskById(board, taskId);
        commit({ type: "setTask", task });
        return task;
      } catch (err) {
        console.log(err);
      }
    },
  },
};
