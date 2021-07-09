const Modal = {
    open(){
        document.querySelector('.modal-overlay')?.classList.add('active');
    },
    
    close(){
        document.querySelector('.modal-overlay')?.classList.remove('active')
    }
}

const Storages = {
    get() {
        return JSON.parse(localStorage.getItem("finances:transaction")  || '{}');
    },

    set(transactions:String) {
        localStorage.setItem("finances:transaction", JSON.stringify(transactions))
    }
}
interface Itransaction {
    [x: string]: any;
    getValues(): { description: string; amount: any; date: any; };
    validateFields(): void;
    formatData() : void;
    clearField() : void;
    description:any;
    amount:any;
    date:any;
}

const Transaction = {
    all: Storages.get(),

    add(transaction:Itransaction | void){
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index:number){
        Transaction.all.splice(index,1) 
        App.reload();

    },
    incomes(){
        //somar entradas
        let income = 0

        Transaction.all.forEach((transaction: { amount: number; }) => {
            if(transaction.amount > 0){
                income += transaction.amount
            }
        })
       
        return income
    },

    expenses(){
        //somar as saídas
        let expense = 0

        Transaction.all.forEach((transaction: { amount: number; }) => {
            if(transaction.amount < 0 ){
                expense += transaction.amount
            }
        })
        return expense
    },
      
    total(){
        //entradas - saídas
        
        
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction: any, index: string | undefined){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction,index)
        tr.dataset.index = index

        DOM.transactionContainer?.appendChild(tr)
    },

    innerHTMLTransaction(transaction: { amount: number; description: any; date: any; },index: string | undefined){
        const CSSclas = transaction.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transaction.amount)
        
        const html = `     
            <td class="description">${transaction.description}</td>
            <td class=${CSSclas}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
            </td>
  
        `

        return html
    },
    
    updateBalance() { 
        let income = document.getElementById('incomeDisplay');
        if(income != null){
            income.innerHTML = Utils.formatCurrency(Transaction.incomes());
        }
        let expense = document.getElementById('expenseDisplay');
        if(expense != null){
            expense.innerHTML = Utils.formatCurrency(Transaction.expenses());
        }
        let total = document.getElementById('totalDisplay');
        if(total != null){
            total.innerHTML = Utils.formatCurrency(Transaction.total())
        }
    },   

    clearTransaction(){
        let transaction = DOM.transactionContainer;
        if(transaction != null){
            transaction.innerHTML = "";
        }
    }

}

const Utils = {
    formatAmount(value: number){
        value = value * 100

        return Math.round(value)
    },
    formatDate(value: string) {
        const splitedDate = value.split("-")
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    },
    formatCurrency(value: string | number) {
        const signal = Number(value) < 0 ? "-": ""

        value = String(value).replace(/\D/g, "") //expreção regular
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}

const Form:Itransaction = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date : document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
  
    validateFields(){
        const {description, amount ,date } = Form.getValues()

        if(description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "" ){
                throw new Error("Por favor, preencha todos os campos")
            }
    },
    formatData(){
        let {description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    clearField(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event:Itransaction){ 
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatData()
            Transaction.add(transaction)
            Form.clearField()
            Modal.close()
           
        } catch (error) {
            alert(error.message)
        }
        Form.formatData()  
    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction: any,index: string | undefined) => { //posso pasar a função addtransaction aqui ... ela recebe os valores
            DOM.addTransaction(transaction,index)
        })
        DOM.updateBalance()
        Storages.set(Transaction.all)
    },
    reload() {
        DOM.clearTransaction()
        App.init()
    },
}

App.init()