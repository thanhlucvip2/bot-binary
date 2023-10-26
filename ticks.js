const getPercentage = (tick_histories) => {
    let numMap = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0
    }
    tick_histories.forEach(t => {
        let num = lastDecimalDigit(t);
        numMap[num] = numMap[num] + 1;
    });
    return {
        0: Number(((numMap["0"] / 1000) * 100).toFixed(2)),
        1: Number(((numMap["1"] / 1000) * 100).toFixed(2)),
        2: Number(((numMap["2"] / 1000) * 100).toFixed(2)),
        3: Number(((numMap["3"] / 1000) * 100).toFixed(2)),
        4: Number(((numMap["4"] / 1000) * 100).toFixed(2)),
        5: Number(((numMap["5"] / 1000) * 100).toFixed(2)),
        6: Number(((numMap["6"] / 1000) * 100).toFixed(2)),
        7: Number(((numMap["7"] / 1000) * 100).toFixed(2)),
        8: Number(((numMap["8"] / 1000) * 100).toFixed(2)),
        9: Number(((numMap["9"] / 1000) * 100).toFixed(2))
    };
}

const lastDecimalDigit = (number) => {
    const decimalString = number.toFixed(2).toString().split('.')[1];
    const lastDigit = decimalString.charAt(decimalString.length - 1);
    return parseInt(lastDigit, 10);
};

module.exports = {
    lastDecimalDigit,
    getPercentage
}