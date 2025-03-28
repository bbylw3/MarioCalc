class Calculator {
    constructor() {
        this.previousOperand = '';
        this.currentOperand = '0';
        this.operation = undefined;
        this.sounds = {
            coin: document.getElementById('coin'),
            jump: document.getElementById('jump'),
            pipe: document.getElementById('pipe')
        };
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.playSound('pipe');
        const display = document.querySelector('.display');
        display.classList.add('show-mario');
        
        // 添加跳跃动画 - 优化马里奥动画效果
        const mario = document.querySelector('.mario-face');
        mario.style.transition = 'transform 0.3s ease-in-out';
        mario.style.transform = 'translate(-50%, -80%)';
        
        // 确保马里奥在跳跃后回到原位
        setTimeout(() => {
            mario.style.transform = 'translate(-50%, -50%)';
        }, 300);

        // 动画结束后隐藏马里奥
        setTimeout(() => {
            display.classList.remove('show-mario');
            mario.style.transition = '';
        }, 1200); // 增加时间让用户更清晰地看到马里奥
    }

    delete() {
        // 如果显示错误，则清除所有内容
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }
        
        if (this.currentOperand === '0') return;
        
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '' || this.currentOperand === '-') {
            this.currentOperand = '0';
        }
        
        this.playSound('jump');
    }

    appendNumber(number) {
        // 如果当前显示错误，则清除后再输入
        if (this.currentOperand === 'Error') {
            this.clear();
            if (number === '.') {
                this.currentOperand = '0.';
            } else {
                this.currentOperand = number.toString();
            }
            this.playSound('coin');
            return;
        }
        
        // 防止多个小数点
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // 限制输入长度，防止溢出
        if (this.currentOperand.length >= 12 && number !== '.') return;
        
        // 处理负号开头的情况
        if (this.currentOperand === '-' && number === '.') {
            this.currentOperand = '-0.';
        } else if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.playSound('coin');
    }

    chooseOperation(operation) {
        // 如果当前显示错误，则不允许继续操作
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }
        
        // 允许使用负数
        if (this.currentOperand === '0' && operation === '-') {
            this.currentOperand = '-';
            this.playSound('jump');
            return;
        }
        
        if (this.currentOperand === '') return;
        
        // 如果已经有一个操作等待执行，先执行它
        if (this.previousOperand !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
        this.playSound('jump');
    }

    compute() {
        // 如果没有操作符或前一个操作数，则不进行计算
        if (this.operation === undefined || this.previousOperand === '') return;
        
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                // 处理除以零的情况
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = undefined;
                    this.previousOperand = '';
                    this.playSound('pipe');
                    return;
                }
                computation = prev / current;
                break;
            case '%':
                // 处理模零的情况
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = undefined;
                    this.previousOperand = '';
                    this.playSound('pipe');
                    return;
                }
                computation = prev % current;
                break;
            default:
                return;
        }

        // 处理计算结果是否为有限数
        if (!isFinite(computation)) {
            this.currentOperand = 'Error';
        } else {
            // 处理小数点后过多位数的情况
            // 如果是整数，直接显示整数
            // 如果是小数，最多保留10位小数
            if (computation === Math.floor(computation)) {
                this.currentOperand = computation.toString();
            } else {
                // 避免科学计数法表示和过长小数
                const preciseComputation = parseFloat(computation.toFixed(10));
                this.currentOperand = preciseComputation.toString();
            }
        }
        
        this.operation = undefined;
        this.previousOperand = '';
        this.playSound('pipe');
        
        // 先更新显示结果
        this.updateDisplay();
        
        // 然后显示马里奥动画
        setTimeout(() => {
            const display = document.querySelector('.display');
            const mario = document.querySelector('.mario-face');
            
            // 添加马里奥胜利动画
            display.classList.add('show-mario');
            
            // 马里奥跳跃并旋转
            mario.style.transition = 'transform 0.5s ease-in-out';
            mario.style.transform = 'translate(-50%, -80%) rotate(360deg)';
            
            setTimeout(() => {
                mario.style.transform = 'translate(-50%, -50%) rotate(0deg)';
            }, 500);
            
            setTimeout(() => {
                display.classList.remove('show-mario');
                mario.style.transition = '';
                // 动画结束后再次更新显示，确保结果可见
                this.updateDisplay();
            }, 1200);
        }, 100);
    }

    // 核心计算逻辑
    evaluate() {
        let computation = this.previousOperand;
        // 使用eval执行运算表达式
        computation = eval(computation + this.currentOperand);
        // 处理计算结果
        if (isNaN(computation)) {
            this.currentOperand = 'Error';
        } else {
            // 处理小数点后过多位数的情况
            // 如果是整数，直接显示整数
            // 如果是小数，最多保留10位小数
            if (computation === Math.floor(computation)) {
                this.currentOperand = computation.toString();
            } else {
                // 避免科学计数法表示和过长小数
                const preciseComputation = parseFloat(computation.toFixed(10));
                this.currentOperand = preciseComputation.toString();
            }
        }
        
        this.operation = undefined;
        this.previousOperand = '';
        this.playSound('pipe');
        
        // 先更新显示结果
        this.updateDisplay();
        
        // 然后显示马里奥动画
        setTimeout(() => {
            const display = document.querySelector('.display');
            const mario = document.querySelector('.mario-face');
            
            // 添加马里奥胜利动画
            display.classList.add('show-mario');
            
            // 马里奥跳跃并旋转
            mario.style.transition = 'transform 0.5s ease-in-out';
            mario.style.transform = 'translate(-50%, -80%) rotate(360deg)';
            
            setTimeout(() => {
                mario.style.transform = 'translate(-50%, -50%) rotate(0deg)';
            }, 500);
            
            setTimeout(() => {
                display.classList.remove('show-mario');
                mario.style.transition = '';
                // 动画结束后再次更新显示，确保结果可见
                this.updateDisplay();
            }, 1200);
        }, 100);
    }

    playSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => console.log('Audio play failed:', error));
        }
    }

    // 格式化数字显示，添加千位分隔符
    getDisplayNumber(number) {
        if (number === 'Error') return 'Error';
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            // 添加千位分隔符
            integerDisplay = integerDigits.toLocaleString('en', { 
                maximumFractionDigits: 0 
            });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }
    
    updateDisplay() {
        const display = document.querySelector('.display');
        // 移除对show-mario的检查，确保结果始终更新
        
        const currentOperandElement = document.querySelector('.current-operand');
        const previousOperandElement = document.querySelector('.previous-operand');
        
        // 更新当前操作数，使用格式化后的数字
        if (this.currentOperand === 'Error') {
            currentOperandElement.textContent = 'Error';
            // 错误时显示红色
            currentOperandElement.style.color = '#FF0000';
        } else {
            currentOperandElement.textContent = this.getDisplayNumber(this.currentOperand);
            // 恢复正常颜色
            currentOperandElement.style.color = '';
        }
        
        // 更新上一个操作数和运算符
        if (this.operation != null) {
            previousOperandElement.textContent = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            previousOperandElement.textContent = '';
        }

        // 当数字变化时添加缩放动画
        currentOperandElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            currentOperandElement.style.transform = 'scale(1)';
        }, 100);
    }
}

const calculator = new Calculator();

document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        // 数字按钮
        if (button.dataset.value) {
            calculator.appendNumber(button.dataset.value);
            calculator.updateDisplay();
        }
        // 操作符按钮
        else if (button.dataset.action === 'operator') {
            calculator.chooseOperation(button.textContent);
            calculator.updateDisplay();
        }
        // 清除按钮
        else if (button.dataset.action === 'clear') {
            calculator.clear();
            calculator.updateDisplay();
        }
        // 删除按钮
        else if (button.dataset.action === 'delete') {
            calculator.delete();
            calculator.updateDisplay();
        }
        // 计算按钮
        else if (button.dataset.action === 'calculate') {
            calculator.compute();
            // 注意：compute方法内部会处理显示更新
        }
    });
});