"use strict";
var Modal = {
    open: function () {
        var _a;
        (_a = document.querySelector('.modal-overlay')) === null || _a === void 0 ? void 0 : _a.classList.add('active');
    },
    close: function () {
        var _a;
        (_a = document.querySelector('.modal-overlay')) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
    }
};
var Storages = {
    get: function () {
        return JSON.parse(localStorage.getItem("finances:transaction") || '{}');
    },
    set: function (transactions) {
        localStorage.setItem("finances:transaction", JSON.stringify(transactions));
    }
};
var Transaction = {
    all: Storages.get(),
    add: function (transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },
    remove: function (index) {
        Transaction.all.splice(index, 1);
        App.reload();
    },
    incomes: function () {
        //somar entradas
        var income = 0;
        Transaction.all.forEach(function (transaction) {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        });
        return income;
    },
    expenses: function () {
        //somar as saídas
        var expense = 0;
        Transaction.all.forEach(function (transaction) {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        });
        return expense;
    },
    total: function () {
        //entradas - saídas
        return Transaction.incomes() + Transaction.expenses();
    }
};
var DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),
    addTransaction: function (transaction, index) {
        var tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionContainer.appendChild(tr);
    },
    innerHTMLTransaction: function (transaction, index) {
        var CSSclas = transaction.amount > 0 ? "income" : "expense";
        var amount = Utils.formatCurrency(transaction.amount);
        var html = "     \n            <td class=\"description\">" + transaction.description + "</td>\n            <td class=" + CSSclas + ">" + amount + "</td>\n            <td class=\"date\">" + transaction.date + "</td>\n            <td>\n                <img onclick=\"Transaction.remove(" + index + ")\" src=\"./assets/minus.svg\" alt=\"Remover Transa\u00E7\u00E3o\">\n            </td>\n  \n        ";
        return html;
    },
    updateBalance: function () {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },
    clearTransaction: function () {
        DOM.transactionContainer.innerHTML = "";
    }
};
var Utils = {
    formatAmount: function (value) {
        value = value * 100;
        return Math.round(value);
    },
    formatDate: function (value) {
        var splitedDate = value.split("-");
        return splitedDate[2] + "/" + splitedDate[1] + "/" + splitedDate[0];
    },
    formatCurrency: function (value) {
        var signal = Number(value) < 0 ? "-" : "";
        value = String(value).replace(/\D/g, ""); //expreção regular
        value = Number(value) / 100;
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
        return signal + value;
    }
};
var Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues: function () {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        };
    },
    validateFields: function () {
        var _a = Form.getValues(), description = _a.description, amount = _a.amount, date = _a.date;
        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos");
        }
    },
    formatData: function () {
        var _a = Form.getValues(), description = _a.description, amount = _a.amount, date = _a.date;
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        return {
            description: description,
            amount: amount,
            date: date
        };
    },
    clearField: function () {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },
    submit: function (event) {
        event.preventDefault();
        try {
            Form.validateFields();
            var transaction = Form.formatData();
            Transaction.add(transaction);
            Form.clearField();
            Modal.close();
        }
        catch (error) {
            alert(error.message);
        }
        Form.formatData();
    }
};
var App = {
    init: function () {
        Transaction.all.forEach(function (transaction, index) {
            DOM.addTransaction(transaction, index);
        });
        DOM.updateBalance();
        Storages.set(Transaction.all);
    },
    reload: function () {
        DOM.clearTransaction();
        App.init();
    },
};
App.init();
