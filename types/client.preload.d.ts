declare let clientAPI: {
    sayHello(hello: string): void;
};
declare global {
    const electron: typeof clientAPI;
}
export {};
