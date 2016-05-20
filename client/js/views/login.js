define(['views/form',
    'tpl!templates/login.html',
    'jquery',
    'backbone',
    
    'jquery-ui',
    'backbone-validation',
    
    ], function(FormView,
        template, $, Backbone) {


    var Login = Backbone.Model.extend({
        url: '/authenticate',
        validation: {
            login: {
                required: true,
            },

            password: {
                required: true
            },
        }
    })


    return FormView.extend({
        template: template,
        
        createModel: function() {
            this.model = new Login()
        },

        onRender: function() {
            if (!app.token) this.checkExistingSession()
        },

        // Hack for CAS SSO
        checkExistingSession: function() {
            var self = this
            var fr = $('iframe')
            fr.load(function() {
                var content = fr.contents().text()
                if (content) {
                    try {
                        var response = JSON.parse(content)
                        if ('jwt' in response) {
                            app.alert({ message: 'Found a valid session, auto-logging you in' })
                            self.$el.find('form').addClass('loading')
                            setTimeout(function() {
                                self.setToken(response)
                            }, 2000)
                        }
                    } catch(err) {
                        // Not valid JSON
                    }
                }
            })
            fr.attr('src',app.apiurl+'/authenticate/check')
        },

        onShow: function() {
            if (app.token) {
                console.log('invald token alert')
                app.alert({ message: 'Your session has expired, please log in again', persist: 'login' })
            }
        },
        
        success: function(model, response, options) {
            this.setToken(response)
        },

        setToken: function(response) {
            app.token = response.jwt

            sessionStorage.setItem('token', app.token)
            this.$el.find('form').addClass('loading')
            app.getuser({
                callback: function() {
                    var url = window.location.pathname.substr(Backbone.history.root.length);
                    if (url) {
                        app.navigate('/', { trigger: false });
                        app.navigate(url, { trigger: true });
                    } else app.trigger('go:home')
                }
            })
        },

        failure: function(model, response, options) {
            console.log('failure from login')
            app.alert({ message: 'We couldnt log you in, maybe your password or username were incorrect?'})
        },
    })

})