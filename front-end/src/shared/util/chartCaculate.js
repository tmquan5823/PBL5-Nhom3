import { dateToArray } from "../help/DateFormat";

const filterData = (transactions, walletIds, categoryIds, note, dateStart, dateEnd, type) => {
    if (transactions && transactions.length > 0) {
        console.log(transactions)
        return transactions.filter(item => {
            // Check walletId
            if (walletIds && walletIds.length >= 0 && !walletIds.includes(item.wallet_id)) {
                return false;
            }

            // Check categoryId
            if (categoryIds && (categoryIds.length <= 0 || !categoryIds.includes(item.category ? item.category.id : item.category_id))) {
                return false;
            }

            // Check note
            if (note && item.note.toLowerCase().indexOf(note.toLowerCase()) === -1) {
                return false;
            }

            // Check dateStart and dateEnd
            if (dateStart && !isDateAfter(item.dateTransaction.slice(0, 3), dateToArray(new Date(dateStart)))) {
                return false;
            }
            if (dateEnd && !isDateBefore(item.dateTransaction.slice(0, 3), dateToArray(new Date(dateEnd)))) {
                return false;
            }

            if (type) {
                const isIncome = item.amount > 0;
                if (type === 'income' && !isIncome) {
                    return false;
                }
                if (type === 'outcome' && isIncome) {
                    return false;
                }
            }
            return [];
        });
    }
    return [];
}


const filterWallet = (wallets, walletIds) => {
    if (wallets && walletIds && walletIds.length > 0) {
        return wallets.filter(item => {
            if (!walletIds.includes(item.id)) {
                return false;
            }
            return true;
        })
    }
    return [];
}

const filterCategory = (categories, type, categoryIds) => {
    return categories.filter(item => {
        if (categoryIds.length > 0 && !categoryIds.includes(item.category_id)) {
            return false;
        }
        if (type) {
            const isIncome = item.category.income
            if (type === 'income' && !isIncome) {
                return false;
            }
            if (type === 'outcome' && isIncome) {
                return false;
            }
        }
        return true;
    });
};

//AreaChart 
const dataAreaChart = (transactions, wallets) => {
    // Khởi tạo một object để lưu trữ kết quả tính toán tạm thời
    const tempData = {};

    // Bước 1: Tính tổng số tiền khởi điểm từ các ví
    const moneyAtFirst = wallets.reduce((acc, wallet) => acc + wallet.moneyAtFirst, 0);

    // Bước 2: Chuyển đổi ngày từ dạng mảng thành chuỗi ngày dạng "YYYY-MM-DD"
    const transactionsWithFormattedDate = transactions.map(transaction => {
        const [year, month, day] = transaction.dateTransaction;
        return {
            ...transaction,
            formatted_date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        };
    });

    // Bước 3: Tính tổng số tiền cho mỗi ngày và lưu vào object tempData
    transactionsWithFormattedDate.forEach(transaction => {
        const date = transaction.formatted_date;
        if (!tempData[date]) {
            tempData[date] = 0;
        }
        tempData[date] += transaction.amount;
    });

    // Bước 4: Chuyển đổi object tempData thành mảng các object với ngày và tổng số tiền
    const formattedResult = Object.keys(tempData).map(date => {
        return {
            "name": date,
            amount: tempData[date] + moneyAtFirst // Cộng tổng số tiền từ giao dịch với số tiền khởi điểm
        };
    });

    return formattedResult;
};


//BarChart
const dataBarChart = (transactions) => {
    // Khởi tạo một object để lưu trữ kết quả tính toán tạm thời
    const tempData = {};

    // Bước 1: Chuyển đổi ngày từ dạng mảng thành chuỗi ngày dạng "YYYY-MM-DD"
    const transactionsWithFormattedDate = transactions.map(transaction => {
        const [year, month, day] = transaction.dateTransaction;
        return {
            ...transaction,
            formatted_date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        };
    });

    // Bước 2: Tính tổng số tiền cho mỗi ngày và lưu vào object tempData
    transactionsWithFormattedDate.forEach(transaction => {
        const date = transaction.formatted_date;
        if (!tempData[date]) {
            tempData[date] = { income: 0, outcome: 0 };
        }
        if (transaction.amount >= 0) {
            tempData[date].income += transaction.amount;
        } else {
            tempData[date].outcome += transaction.amount;
        }
    });

    // Bước 3: Chuyển đổi object tempData thành mảng các object với ngày, thu nhập và chi tiêu
    const formattedResult = Object.keys(tempData).map(date => {
        return {
            "name": date,
            "Thu nhập": tempData[date].income,
            "Chi tiêu": tempData[date].outcome < 0 ? -tempData[date].outcome : 0
        };
    });

    return formattedResult;
};

//DoughnutChartDataIncome

// const data = {
//     labels: [
//         'Red',
//         'Blue',
//         'Yellow'
//     ],
//     datasets: [{
//         data: [100, 50, 100],
//         backgroundColor: [
//             'rgb(255, 99, 132)',
//             'rgb(54, 162, 235)',
//             '#6495ED'
//         ],
//     }]
// };


const dataDoughnutChart = (categories, transactions) => {
    const data = {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: []
        }]
    };

    const categoryData = [];

    const transactionCategoryIds = new Set(transactions.map(transaction => transaction.category_id));

    const totalAmountAllCategories = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    if (categories) {
        categories.forEach(categoryItem => {
            const category = categoryItem.category;
            const categoryId = category.id;
            if (transactionCategoryIds.has(categoryId)) {
                const categoryTransactions = transactions.filter(transaction => transaction.category_id === categoryId);

                const totalAmount = categoryTransactions.reduce((acc, transaction) => acc + transaction.amount, 0);

                const percentage = (totalAmount / totalAmountAllCategories) * 100;

                data.labels.push(category.content);
                data.datasets[0].data.push(percentage);
                data.datasets[0].backgroundColor.push(category.iconColor);

                categoryData.push({
                    id: category.id,
                    iconUrl: category.iconUrl,
                    iconColor: category.iconColor,
                    amount: totalAmount,
                    transactionTimes: categoryTransactions.length,
                    content: category.content // Add category content here
                });
            }
        })
    }
    return { chartData: data, categoryData: categoryData };
};






// Function to check if a date is after another date
const isDateAfter = (dateArray, comparisonDate) => {
    if (dateArray && comparisonDate) {
        const [year, month, day] = dateArray;
        const [compYear, compMonth, compDay] = comparisonDate;
        const date = new Date(year, month - 1, day); // Subtract 1 from month because JavaScript months are 0-indexed
        const compDate = new Date(compYear, compMonth - 1, compDay);
        return date >= compDate;
    }
    return false;
}

// Function to check if a date is before another date
const isDateBefore = (dateArray, comparisonDate) => {
    if (dateArray && comparisonDate) {
        const [year, month, day] = dateArray;
        const [compYear, compMonth, compDay] = comparisonDate;
        const date = new Date(year, month - 1, day); // Subtract 1 from month because JavaScript months are 0-indexed
        const compDate = new Date(compYear, compMonth - 1, compDay);
        return date <= compDate;
    }
    return false;
}



export { filterData, filterWallet, filterCategory, dataAreaChart, dataBarChart, dataDoughnutChart };
