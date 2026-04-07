export function isDatabaseConnectionError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    
    return (
        error.message.includes("Can't reach database server") ||
        error.message.includes("Connection refused") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("P1001") || // Prisma: can't reach DB
        error.message.includes("P1002") || // Prisma: DB timed out
        error.message.includes("P1017")    // Prisma: server closed connection
    );
}