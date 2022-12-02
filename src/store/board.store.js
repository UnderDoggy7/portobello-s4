import { boardService } from '../services/board.service.js'

export function getActionRemoveBoard(boardId) {
    return {
        type: 'removeBoard',
        boardId
    }
}
export function getActionAddBoard(board) {
    return {
        type: 'addBoard',
        board
    }
}
export function getActionUpdateBoard(board) {
    return {
        type: 'updateBoard',
        board
    }
}

export function getActionAddBoardMsg(boardId) {
    return {
        type: 'addBoardMsg',
        boardId,
        txt: 'Stam txt'
    }
}

export const boardStore = {
    state: {
        boards: [],
        currBoard:null,
        currTask:null
    },
    getters: {
        boards({boards}) { return boards },
        currBoard({currBoard}) {return currBoard}
    },
    mutations: {
        setBoards(state, { boards }) {
            state.boards = boards
        },
        addBoard(state, { board }) {
            state.boards.push(board)
        },
        updateBoard(state, { board }) {
            const idx = state.boards.findIndex(c => c.id === board._id)
            state.boards.splice(idx, 1, board)
        },
        removeBoard(state, { boardId }) {
            state.boards = state.boards.filter(board => board._id !== boardId)
        },
        addBoardMsg(state, { boardId , msg}) {
            const board = state.boards.find(board => board._id === boardId)
            if (!board.msgs) board.msgs = []
            board.msgs.push(msg)
        },
        setCurrBoard(state, board){
            state.currBoard = board
        },
        setTask(state,{task}){
            state.currTask = task
        }
    },
    actions: {
        async addBoard(context, { board }) {
            console.log("🚀 ~ file: board.store.js:59 ~ addBoard ~ board", board)
            console.log(board);
            try {
                board = await boardService.save(board)
                context.commit(getActionAddBoard(board))
                context.commit("setCurrBoard", board)
                return board
            } catch (err) {
                console.log('boardStore: Error in addBoard', err)
                throw err
            }
        },
        async updateBoard(context, { board }) {
            console.log("🚀 ~ file: board.store.js:83 ~ updateBoard ~ board", board)
            try {
                board = await boardService.save(board)
                context.commit(getActionUpdateBoard(board))
                context.commit("setCurrBoard", board)
                return board
            } catch (err) {
                console.log('boardStore: Error in updateBoard', err)
                throw err
            }
        },
        async loadBoards(context) {
            try {
                const boards = await boardService.query()
                context.commit({ type: 'setBoards', boards })
            } catch (err) {
                console.log('boardStore: Error in loadBoards', err)
                throw err
            }
        },
        async removeBoard(context, { boardId }) {
            try {
                await boardService.remove(boardId)
                context.commit(getActionRemoveBoard(boardId))
            } catch (err) {
                console.log('boardStore: Error in removeBoard', err)
                throw err
            }
        },
        async addBoardMsg(context, { boardId, txt }) {
            try {
                const msg = await boardService.addBoardMsg(boardId, txt)
                context.commit({type: 'addBoardMsg', boardId, msg })
            } catch (err) {
                console.log('boardStore: Error in addBoardMsg', err)
                throw err
            }
        },
        async loadTask({commit},{board,taskId}){
            try {
                const task = boardService.getTaskById(board,taskId)
                commit({type:'setTask',task})
                return task
            } catch (error) {
                
            }
        },
        async setCurrBoard ({commit}, boardId){
            console.log(boardId);
            try{
                const board = await boardService.getById(boardId)
                commit("setCurrBoard", board)

            }catch(err){
                console.log('boardStore: Error in setCurrBoard', err)
                throw err
            }
        }

    }
}