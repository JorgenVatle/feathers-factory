declare module 'clues' {
    type Solver = string[] | ((...params: any) => void);
    
    export default function Clues<T>(data: T, key: Solver | Solver[]): any;
}