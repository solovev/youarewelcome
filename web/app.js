Vue.component('message', {
    props: ['fromOpponent', 'content'],
    computed: {
        /**
         * Возвращает текущее время в формате HH:MM
         */
        currentTime: function () {
            var time = new Date()
            return ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2)
        }
    },
    mounted: function () {
        // Если месседж пришел от сервера, то оповещаем родителя, что нужно проскроллить список сообщений чата
        if (this.fromOpponent)
            this.$emit('mounted')
    },
    template: `
        <div class="message" :class="{ opponent: fromOpponent }">
            <span class="time">{{ currentTime }}</span>
            <span class="text">{{ content }}</span>
        </div>
    `
})

var app = new Vue({
    el: '#app',
    data: {
        animateButton: false,
        questionContent: '',
        messages: [{
            fromOpponent: true,
            content: 'Привет! Жду от тебя вопроса! (:'
        }]
    },
    methods: {
        /**
         * Обрабатываем нажатие клавиши "Enter" в textarea
         * Если зажат шифт, переводим каретку на новую строку, если нет, то отправляем сообщение
         */
        enter: function (event) {
            if (!event.shiftKey) {
                event.preventDefault()
                this.ask()
            }
        },
        /**
         * Метод, в котором отправляется вопрос специалисту по шушпанчикам
         */
        ask: function () {
            if (this.questionContent.length === 0)
                return
                
            var question = this.questionContent
            this.questionContent = ''

            // Добавляем в список наше сообщение
            this.pushMessage(false, question)

            var vm = this

            // Анимируем кнопку отправки, просто включая ей класс "expand" на 0.1 секунды
            this.animateButton = true
            setTimeout(function() { vm.animateButton = false }, 100)

            // Создаем post-запрос с параметром 'q'
            var params = new URLSearchParams()
            params.append('q', question)
            axios.post('/api/get-answer', params)
                .then(function (response) {
                    vm.pushMessage(true, response.data.a)
                })
            this.scrollChat()
        },
        pushMessage: function (fromOpponent, content) {
            this.messages.push({ fromOpponent: fromOpponent, content: content })
        },
        /**
         * Метод для скроллинга списка сообщений вниз
         */
        scrollChat: function () {
            var messagesList = this.$refs.messagesList
            messagesList.scrollTop = messagesList.scrollHeight
        }
    }
})