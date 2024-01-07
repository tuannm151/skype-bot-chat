function isNumeric(val: unknown): val is string | number {
    return (
        !isNaN(Number(Number.parseFloat(String(val)))) &&
      isFinite(Number(val))
    );
}

export {
    isNumeric
};