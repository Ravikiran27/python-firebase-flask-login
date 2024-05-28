$(function () {
    localStorageFeatures();
    initSelects();
    sendRequestToOpenAI();
    copyToClipboard();
    clearDefaultValue();
    dropdown();
    mobileMenu();
    tabs();
    formOptions();
    dropList();
    anchor();
    generateRandomTip();

    setInterval(function () {
        generateRandomTip(true);
    }, 10000);

    if ($(window).width() > 640) {
        dropdownTextAreaActivity();
    }

    if ($(window).width() <= 640) {
        mobileSwipe();
    }
});

function sendRequestToOpenAI() {
    // Блокирует пред запрос
    // Блокирует пред запрос
    // var abortController;

    let limitOfSend = false;
    newMessage = false;

    $('.js-form-openai.new').on('submit', () => {
        newMessage = true;
    });

    $('.js-form-openai.reply').on('submit', () => {
        newMessage = false;
    });

    $('.js-form-openai').on('submit', function (e) {
        const newMyName = $('.new-my-name'),
            newNameTo = $('.new-name-to'),
            newGoal = $('.new-goal');

        e.preventDefault();
        // Блокирует пред запрос
        // if (abortController) {
        //     abortController.abort();
        // }
        // abortController = new AbortController();
        // $('.note.generated-text').removeClass('active');

        $('.note.generated-text').append('Generating <span class="generating-counter">0</span> sec <div class="loader-3"></div>');

        setTimeout(() => {
            $('.note.generated-text').addClass('active');
        }, 500);

        // console.log(newMyName.val().length > 3);

        // let continueCode = false;

        // if (newMessage) {
        //     if (newMyName.val().length > 3 && newNameTo.val().length > 3 && newGoal.val().length > 3) {
        //         continueCode = true;
        //     } else {
        //         continueCode = false;
        //     }
        // } else {
        //     if (newMyName.val().length > 3 && newNameTo.val().length > 3 && newGoal.val().length > 3) {
        //         continueCode = true;
        //     } else {
        //         continueCode = false;
        //     }
        // }

        $('html').animate({
                scrollTop: $('[data-result-block]').offset().top - 40,
            },
            500
        );

        if (limitOfSend === true) return;
        var startTime = new Date().getTime();

        // const newMessage = Boolean($(this).find('.timeline').attr('data-new-form'));



        // Блок Результата запроса 
        var $form = $(this);
        var $resultBlock = $('[data-result-block]');
        $resultBlock.removeClass('done');

        // Удаляем время под блоком результата
        // $resultBlock.find('.generated-text').remove(); //remove generated text from previous request
        var $resultTextarea = $('[data-result-textarea]');
        var $button = $form.find('.js-button');

        var url = $form.attr('data-url');

        // статус результата 
        $form.find('.response-status').removeClass('active');

        // кнопка запроса не активна
        $button.attr("disabled", "");

        let genCount = 0;

        const generatingCounter = setInterval(function () {
            genCount += 1;
            $('.generating-counter').html(genCount);
            console.log(genCount);
        }, 1000);

        if (newMessage) {
            $button.html("Generating With Ai <div class='loader'></div>");
        } else {
            $button.html("Generating With Ai <div class='loader-2'></div>");
        }


        // статус возле кнопки - заполнен
        // $button.closest('.timeline-item').removeClass('empty');
        // $form.find('.submit-status').addClass('active');

        // Show a loading spinner while the block is being processed
        $resultBlock.append('<div class="custom-loader-holder"><div class="custom-loader"><div class="shadow"></div><div class="box"></div></div></div>');

        // собираем данные с полей ввода где есть атр name
        var data = {};
        $form.find('input, select, textarea').each(function () {
            var attrName = $(this).attr('name');
            if (attrName) {
                data[attrName] = $(this).val();
            }
        });

        // selects new and reply: собираем данные с полей ввода где есть атр name
        $('[data-options]').find('input, select, textarea').each(function () {
            var attrName = $(this).attr('name');
            if (attrName) {
                data[attrName] = $(this).val();
            }
        });

        async function fetchData() {
            // var attempts = 0, maxAttempts = 1;
            // while (attempts < maxAttempts) {
            //Fetch the API endpoint

            // console.log(data);

            try {
                // var response = await fetch("openai.php", {
                var response = await fetch(url, {
                    method: "POST",
                    body: JSON.stringify({
                        data: data
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // Блокирует пред запрос
                    // signal: abortController.signal
                });

                if (!response.ok) {
                    throw new Error(response.status);
                }

                // var responseText = await response.text();
                // responseText = responseText.trim();

                // сортируем response по переменным
                var responseJson = await response.json(),
                    responseText = responseJson.messageBody,
                    responseSubject = responseJson.subject,
                    responseSuggestion = responseJson.suggestion,
                    responseCategory = responseJson.category,
                    dailyLimit = responseJson.daily_limit_reached,
                    messagesLeft = responseJson.messages_left;

                if (dailyLimit && messagesLeft === 0) {
                    const message = $('.result-message').attr('data-message');
                    $('[data-textarea-wrap]').css("display", "none");
                    $('[data-input-wrap]').css("display", "none");
                    $('.result-message').addClass('active').find('p').html(message);
                    $('html').animate({
                            scrollTop: $('[data-result-block]').offset().top - 40,
                        },
                        500
                    );
                    limitOfSend = true;
                } else {
                    showResult(responseSubject, responseSuggestion, responseCategory, responseText);
                }

                // recaptchaError = responseJson.recaptchaError;

                // $form.find('.submit-status').removeClass('active');
                $form.find('.response-status').addClass('active');

                function showResult(responseSubject, responseSuggestion, responseCategory, responseText) {
                    // тема письма
                    if (responseSubject) {
                        showSubject(responseSubject);
                    }
                    if (responseSuggestion) {
                        showAdvice(responseSuggestion, responseCategory);
                    }

                    if (responseText) {
                        responseText = responseText.replace(/<\s*br\s*\/?>/gi, '\n');
                        $resultTextarea.val(responseText);

                        // высота текстареа подстравивается под текст
                        $resultTextarea.attr('style', 'height: 1px');
                        $resultTextarea.attr('style', 'height: ' + parseInt(10 + $resultTextarea.get(0).scrollHeight) + 'px');

                        $('html, body').animate({
                            scrollTop: $resultBlock.offset().top - 10
                        }, 500);

                        // разброкирует resultBlock
                        $resultBlock.addClass('done');

                        $('[data-filled]').addClass('colored');

                        // высчитываем время и рендерим новую строку со временем
                        var generatedText = $resultBlock.data('result-text');
                        if (generatedText) {
                            var numOfChars = $resultTextarea.val().length;
                            var savedTime = numOfChars * 0.3;
                            var savedMinutes = Math.floor(savedTime / 60);
                            var savedSeconds = Math.floor(savedTime % 60);

                            var endTime = new Date().getTime();
                            var generatedTime = parseInt((endTime - startTime) / 1000);

                            generatedText = generatedText.replace(/%generated_time%/g, generatedTime).replace(/%saved_min%/g, savedMinutes).replace(/%saved_sec%/g, savedSeconds);

                            $('.note.generated-text').text(generatedText);

                            setTimeout(() => {
                                $('.note.generated-text').addClass('active');
                            }, 500);

                            // $resultBlock.append('<span class="note generated-text">' + generatedText + '</span>');
                        }

                        // data['formula'] = 'get_advice';
                        // data['output'] = responseText;
                        // fetchData();
                    }
                }

                clearInterval(generatingCounter);

                // if (recaptchaError) {
                //     hideSubject();

                //     // выводит ошбику под капчу
                //     $form.find('[data-recaptcha-error]').html(recaptchaError).show();
                // } else {
                //     // $('[data-recaptcha-error]').hide();

                //     // //reset recaptcha for new email or reply email
                //     // var recaptchaNumber = $form.find('[data-recaptcha-number]').attr('data-recaptcha-number');
                //     // grecaptcha.reset(recaptchaNumber);

                //     // $button.attr("disabled", "");

                //     $('[data-recaptcha-holder]').hide();
                //     $('[data-recaptcha-button]').removeAttr("disabled");
                // }

                // if (responseJson.daily_limit_reached) {
                //  $('#modalCenter').modal('show');
                // }


                $button.removeAttr("disabled");

                // после первого запроса другой текст
                var newText = $button.attr("data-rename-to");
                $button.html(newText); //replace text in button
                $button.closest('.timeline-item').addClass('empty');
                $resultBlock.find('.custom-loader-holder').remove(); //remove loader

            } catch (error) {
                console.dir(error);

                $resultTextarea.val(error);

                $button.removeAttr("disabled");
                $resultBlock.find('.custom-loader-holder').remove(); //remove loader

                // $form.find('.submit-status').removeClass('active');
            }
            // }

            // if (attempts >= maxAttempts) {
            //  $resultTextarea.val($('[data-error]').attr('data-error-empty-response'));
            // }

            // $('[data-message]').removeClass('d-none'); //show message on top
        }

        //send request to get main letter
        fetchData();

        // //send request to get text for Mail Assistant
        // data['formula'] = 'get_advice';
        // fetchData();

    });
}

function localStorageFeatures() {
    //fill fields with localstorage values on page load (works for inputs and selects)
    for (var key of Object.keys(localStorage)) {
        if (key.startsWith("local_")) {
            var value = localStorage.getItem(key);
            $('[data-local="' + key + '"]').val(value);
        }
    }
    //fill inputs with test data if the user has not edited the "Your name" field
    if (localStorage.getItem("local_your_name") === null) {
        $('[data-default-value]').each(function () {
            var $this = $(this);
            $this.val($this.attr('data-default-value'));
        });
    }

    //save local on change
    $('[data-local]').on('change', function () {
        var $this = $(this);
        var name = $this.attr('data-local');
        var value = $this.val();
        localStorage.setItem(name, value);
        $('[data-local="' + name + '"]').val(value); //synchronize inputs
    });
}

function initSelects() {
    // Default select2
    const select2 = $('.select2');
    if (select2.length) {
        select2.each(function () {
            var $this = $(this);
            $this.wrap('<div class="position-relative"></div>').select2({
                minimumResultsForSearch: -1,
                placeholder: 'Select value',
                dropdownParent: $this.parent()
            });
        });
    }

    // select2 icons
    const select2Icons = $('.select2-icons');
    if (select2Icons.length) {
        // custom template to render icons
        function renderIcons(option) {
            if (!option.id) {
                return option.text;
            }
            var $icon = "<div class='wrap-svg'><svg class='" + " svg-icon'><use xlink:href='" + '#' + $(option.element).data('icon') + "'></use></svg></div>" + option.text;

            return $icon;
        }
        select2Icons.wrap('<div class="position-relative"></div>').select2({
            minimumResultsForSearch: -1,
            templateResult: renderIcons,
            templateSelection: renderIcons,
            escapeMarkup: function (es) {
                return es;
            }
        });

        $('select').each(function () {
            var $select = $(this),
                $selected_icon, $selected_text;
            $select.find('option').each(function () {
                var $option = $(this);
                if ($option.is(':selected')) {
                    $selected_text = $option.text();
                    $selected_icon = $option.attr('data-icon');
                }
            });

            var $item = '<div class="js-open-select2 item mx-2 my-1" data-select-name="' + $select.attr('name') + '">' +
                '<i data-icon class="icon ' + $selected_icon + '"></i>' +
                '<span data-text class="text d-none d-sm-inline-block ms-1">' + $selected_text + '</span>' +
                '</div>';

            $('[data-selected-options]').append($item);

        });
        $('select').on('change', function () {
            var $select = $(this);

            $select.find('option').each(function () {
                var $option = $(this);
                if ($option.is(':selected')) {
                    $selected_text = $option.text();
                    $selected_icon = $option.attr('data-icon');
                }
            });

            var $replace_select = $('[data-select-name="' + $select.attr('name') + '"]');
            $replace_select.find('[data-icon]').attr('class', $selected_icon);
            $replace_select.find('[data-text]').text($selected_text);
        });

        $('body').on('click', '.js-open-select2', function () {
            var $options = $('#options');
            var $select = $('select[name="' + $(this).attr('data-select-name') + '"]');

            if ($options.hasClass('show')) {
                $select.select2('open');
            } else {
                $options.collapse('show').one('shown.bs.collapse', function () {
                    $select.select2('open');
                });
            }
        });

    }
}

function showSubject(subject) {
    var $resultSubject = $('[data-result-subject]');

    if (subject) {
        $resultSubject.parent().removeClass('d-none');
        $resultSubject.val(subject)
    } else {
        $resultSubject.parent().addClass('d-none');
    }
}

function hideSubject() {
    var $resultSubject = $('[data-result-subject]');
    $resultSubject.parent().addClass('d-none');
}

function copyToClipboard() {
    $('.js-copy-to-clipboard').on('click', function () {
        var $this = $(this);
        $this.addClass('clicked');

        $this.find('.svg-icon use').attr('xlink:href', '#icon-copy-white');
        $this.css("background-color", "#7752FE");
        $this.parent().find('.copy-message').addClass('active');
        $this.parent().find('.copy-message-triangle').addClass('active');

        setTimeout(function () {
            $this.removeClass('clicked');
            $this.blur();
            $('.tooltip').remove();
            $this.find('.svg-icon use').attr('xlink:href', '#icon-copy');
            $this.css("background-color", "");
            $this.parent().find('.copy-message').removeClass('active');
            $this.parent().find('.copy-message-triangle').removeClass('active');
        }, 1500);

        var text = $this.closest('.wrap-control').find('textarea, input').val();

        navigator.clipboard.writeText(text)
            .then(() => {
                // console.log('Result was copied to clipboard.');
            })
            .catch((error) => {
                console.error('Failed to copy result: ', error);
            });
    });
}

function generateRandomTip(animate) {
    var $tipsField = $('[data-list-tips]');
    var $tipText = $('[data-tip-text]');
    if ($tipsField.length && $tipText.length) {
        var listTips = $tipsField.val().split("\n");
        var tipNumber = Math.floor(Math.random() * listTips.length)
        var $icom = $('[data-animated-icon]');
        if (animate) {
            $icom.stop().animate({
                opacity: 0.5
            }, 300);

            $tipText.stop().animate({
                opacity: 0
            }, 300, function () {
                $(this).html(listTips[tipNumber]);
                $(this).stop().animate({
                    opacity: 1
                }, 300);

                $icom.stop().animate({
                    opacity: 1
                }, 300);
            });
        } else {
            $tipText.html(listTips[tipNumber]);
        }
    }
}

function clearDefaultValue() {
    //clear default fields on click
    $('[data-default-value]').one('focus', function () {
        // if (localStorage.getItem("local_your_name") === null) {

        // }
        $(this).val('');

        showInputActiveLine();

        // const form = $(this).closest('.js-form-openai');
        // const timeline = form.find('.timeline');
        // const points = timeline.find('.point');

        // if ($(this).hasClass('new-my-name')) {
        //     $(points[0]).removeClass('active');
        // } else if ($(this).hasClass('new-name-to')) {
        //     $(points[1]).removeClass('active');
        // } else if ($(this).hasClass('new-goal')) {
        //     $(points[2]).removeClass('active');
        // } else if ($(this).hasClass('reply-my-name')) {
        //     $(points[0]).removeClass('active');
        // }

    });
}

function showAdvice(suggestion, category) {
    if (suggestion) {
        $('[data-suggestion]').removeAttr('data-tip-text').html(suggestion);

        // статус done
        $('[data-change-color]').addClass('colored');

        // кнопка советчика
        if (category) {
            $('[data-category]').removeClass('d-none').find('.btn-assistant .text').html(category);
        }

        $('.assistant-header .svg-icon use').attr('xlink:href', '#icon-user-friendly-active');
    }
}

function dropdown() {
    let $scrollableElements = document.querySelectorAll('.hide-desktop .dropdown');

    $(".js-btn-drop").on("click", function () {
        var $this = $(this);

        if ($this.hasClass("show")) {
            $this.removeClass("show");
            $(".dropdown").slideUp();
            scrollLock.enablePageScroll($scrollableElements);

        } else {
            $this.addClass("show");
            $(".dropdown").slideDown();
            scrollLock.disablePageScroll($scrollableElements);
        }
    });

    $(".wrapper").on("click", function (event) {
        if (!$(event.target).closest(".js-btn-drop, .dropdown").length) {
            if ($(".js-btn-drop").hasClass("show")) {
                $(".js-btn-drop").removeClass("show");
                $(".dropdown").slideUp();
            }
        }
    });
}

function dropdownTextAreaActivity() {
    $(".js-btn-activity").on("click", function () {
        var $this = $(this);

        if ($this.hasClass("show")) {
            $this.removeClass("show").next().slideUp();

        } else {
            $this.addClass("show").next().slideDown();
        }
    });
}

function mobileMenu() {
    $(".js-btn-dots").on("click", function () {
        var $this = $(this),
            parent = $this.closest(".header");

        if (parent.hasClass("open")) {
            parent.removeClass("open");
        } else {
            parent.addClass("open");
        }
    });

    $(".wrapper").on("click", function (event) {
        if (!$(event.target).closest(".js-btn-dots, .header .cols-2, .sidebar").length) {
            if ($(".header").hasClass("open")) {
                $(".header").removeClass("open");
            }
        }
    });

    $(".wrapper.logged").on("click", function (event) {
        if (!$(event.target).closest(".js-btn-dots, .sidebar").length) {
            if ($(".header").hasClass("open")) {
                $(".header").removeClass("open");
            }
        }
    });
}

function tabs() {
    var $tab = $(".tab-box.active");
    // $(".tab-box.active");

    $tab.slideDown();
    $(".js-btn-tab").on("click", function () {
        var $this = $(this);
        var tabId = $this.attr("data-tab");

        $(".js-btn-tab").removeClass("active");
        $(".tab-box").removeClass("active").slideUp();

        $this.addClass("active");
        $("#" + tabId).addClass("active").slideDown();

    });
}

function formOptions() {
    $(".js-btn-arrow").on("click", function () {
        var $this = $(this),
            $parent = $this.closest(".form-content");

        if ($parent.hasClass("hide-block")) {
            $parent.removeClass("hide-block");
            $this.addClass("active");
            $(".wrap-options").parent().slideUp();

        } else {
            $parent.addClass("hide-block");
            $this.removeClass("active");
            $(".wrap-options").parent().slideDown();
        }
    });
}

function dropList() {
    $(".js-button-drop").on("click", function () {
        var $this = $(this);

        if ($this.hasClass("show")) {
            $this.find("[data-open]").css("display", "none");
            $this.removeClass("show");

            // $this.removeClass("show").find("[data-open]").slideUp();
        } else {
            $this.find("[data-open]").css("display", "block");
            $this.addClass("show");

            // $this.addClass("show").find("[data-open]").slideDown();
        }
    });
}

function anchor() {

    $(".js-scroll-to").on('click', function () {
        // const pathname = window.location.pathname;
        const id = $(this).attr('data-id-block');

        $('html, body').animate({
            scrollTop: $('#' + id).offset().top
        }, 1000);
    });
}

function mobileSwipe() {
    let swipeContainer = $(".js-mobile-swipe");
    let $body = $("body");
    let $scrollableElements = document.querySelectorAll('.field-result');

    swipeContainer.each((index, item) => {
        $(item).on("touchstart", handleTouchStart);
    });
    swipeContainer.each((index, item) => {
        $(item).on("touchmove", handleTouchMove);
    });

    var xDown = null;
    var yDown = null;

    function getTouches(evt) {
        return evt.touches || // browser API
            evt.originalEvent.touches; // jQuery
    }

    function handleTouchStart(evt) {
        const firstTouch = getTouches(evt)[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    };

    function handleTouchMove(evt) {
        if (!xDown || !yDown) {
            return;
        }

        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            /*most significant*/
            if (xDiff > 0) {
                /* right swipe */
                if ($(this).hasClass("right")) {
                    $(this).removeClass("right");
                } else {
                    $(this).addClass("left");
                }
            } else {
                /* left swipe */
                if ($(this).hasClass("left")) {
                    $(this).removeClass("left");
                } else {
                    $(this).addClass("right");
                }
            }
        }

        /* reset values */
        xDown = null;
        yDown = null;
    };


    swipeContainer.on("click", function (e) {
        var $this = $(this);

        if (!$body.hasClass("card-opend")) {
            $body.addClass("card-opend");
            scrollLock.disablePageScroll($scrollableElements);

            if ($this.hasClass("show")) {
                $this.removeClass("show");
            } else {
                $this.addClass("show");
                $("html, body").animate({
                    scrollTop: 0
                }, 0);
            }
        }
    });

    $(".js-btn-back").on("click", function () {
        $body.removeClass("card-opend");
        scrollLock.enablePageScroll($scrollableElements);
        swipeContainer.removeClass("show");
        $(".hide-desktop .dropdown").slideUp();
        $(".js-btn-drop").removeClass("show");
    });

}

// function showInputActiveLine() {

//     // new message controls
//     const newMyName = document.querySelector('.new-my-name'),
//         newNameTo = document.querySelector('.new-name-to'),
//         newGoal = document.querySelector('.new-goal'),
//         newTimeline = document.querySelector('.new-timeline');

//     if ($(newTimeline).length === 0) return;
//     const newPoints = newTimeline.querySelectorAll('.point');

//     // new message toggle classes
//     toggleActiveClass(newMyName, newPoints, 0);
//     toggleActiveClass(newNameTo, newPoints, 1);
//     toggleActiveClass(newGoal, newPoints, 2);

//     // reply message controls
//     const buttonForReply = document.querySelector('.js-btn-tab.btn-tab.btn-for-reply');
//     let replyMyName,
//         replySendersName,
//         replyEmailText,
//         replyPurpose,
//         replyTimeline,
//         replyPoints;

//     buttonForReply.addEventListener('click', () => {
//         setTimeout(() => {
//             if (buttonForReply.classList.contains('active')) {
//                 replyMyName = document.querySelector('.reply-my-name'),
//                     replySendersName = document.querySelector('.reply-senders-name'),
//                     replyEmailText = document.querySelector('.reply-email-text'),
//                     replyPurpose = document.querySelector('.reply-purpose'),
//                     replyTimeline = document.querySelector('.reply-timeline'),
//                     replyPoints = replyTimeline.querySelectorAll('.point');

//                 toggleActiveClass(replyMyName, replyPoints, 0);
//                 toggleActiveClass(replySendersName, replyPoints, 1);
//                 toggleActiveClass(replyEmailText, replyPoints, 2);
//                 toggleActiveClass(replyPurpose, replyPoints, 3);
//             }
//         }, 100);
//     });

//     // toggle classes for new message and reply message
//     function toggleActiveClass(inputName, pointsName, indexOfPoint) {
//         inputName.addEventListener('input', () => {
//             inputName.value.length > 0 ? pointsName[indexOfPoint].classList.add('active') : pointsName[indexOfPoint].classList.remove('active');
//         });

//         setTimeout(() => {
//             inputName.value.length > 0 ? pointsName[indexOfPoint].classList.add('active') : pointsName[indexOfPoint].classList.remove('active');
//         }, 100);
//     }
// }

function showInputActiveLine() {
    const newMyName = document.querySelector('.new-my-name');
    const newNameTo = document.querySelector('.new-name-to');
    const newGoal = document.querySelector('.new-goal');
    const newTimeline = document.querySelector('.new-timeline');

    if (!newMyName && !newNameTo && !newGoal) return;

    function updateProgressBar() {

        const newPoints = newTimeline.querySelectorAll('.point');
        newPoints.forEach(point => point.classList.remove('active'));

        let filledInputs = 0;
        if (newMyName.value.trim() !== '') filledInputs++;
        if (newNameTo.value.trim() !== '') filledInputs++;
        if (newGoal.value.trim() !== '') filledInputs++;

        for (let i = 0; i < filledInputs; i++) {
            newPoints[i].classList.add('active');
        }
    }

    newMyName.addEventListener('input', updateProgressBar);
    newNameTo.addEventListener('input', updateProgressBar);
    newGoal.addEventListener('input', updateProgressBar);

    // updateProgressBar();

    setTimeout(() => {
        updateProgressBar();
    }, 50);

    const buttonForReply = document.querySelector('.js-btn-tab.btn-tab.btn-for-reply');
    let replyMyName,
        replySendersName,
        replyEmailText,
        replyPurpose,
        replyTimeline,
        replyPoints;

    buttonForReply.addEventListener('click', () => {
        setTimeout(() => {
            if (buttonForReply.classList.contains('active')) {
                replyMyName = document.querySelector('.reply-my-name'),
                    replySendersName = document.querySelector('.reply-senders-name'),
                    replyEmailText = document.querySelector('.reply-email-text'),
                    replyPurpose = document.querySelector('.reply-purpose'),
                    replyTimeline = document.querySelector('.reply-timeline'),
                    replyPoints = replyTimeline.querySelectorAll('.point');
                // if (replyMyName) return;

                updateReplyProgressBar();

                replyMyName.addEventListener('input', updateReplyProgressBar);
                replySendersName.addEventListener('input', updateReplyProgressBar);
                replyEmailText.addEventListener('input', updateReplyProgressBar);
                replyPurpose.addEventListener('input', updateReplyProgressBar);

                $('[data-default-value]').one('focus', function () {
                    updateReplyProgressBar();
                });
            }
        }, 100);
    });



    function updateReplyProgressBar() {

        replyPoints.forEach(point => point.classList.remove('active'));

        let filledInputs = 0;
        if (replyMyName.value.trim() !== '') filledInputs++;
        if (replySendersName.value.trim() !== '') filledInputs++;
        if (replyEmailText.value.trim() !== '') filledInputs++;
        if (replyPurpose.value.trim() !== '') filledInputs++;

        for (let i = 0; i < filledInputs; i++) {
            replyPoints[i].classList.add('active');
        }


    }



}

function changeSelectAfterBtnClick() {
    const writeAsBtn = $('.btn-option');

    writeAsBtn.on('click', (e) => {
        var $btn = $('.js-btn-arrow'),
            $parent = $btn.closest(".form-content");

        let currentBtn = $(e.currentTarget);
        let currentData = $(e.currentTarget).attr('data-button');
        let currentSelect = '.select2.' + currentData;

        if ($parent.hasClass("hide-block")) {
            $(currentSelect).select2('open');
            $('html').animate({
                    scrollTop: $('.wrap-options').offset().top - 30,
                },
                800
            );
        } else {
            setTimeout(() => {
                $(currentSelect).select2('open');
                $('html').animate({
                        scrollTop: $('.wrap-options').offset().top - 30,
                    },
                    800
                );
            }, 300);
        }

        $(currentSelect).on('select2:select', function (e) {
            let selectedOptionData = e.params.data;
            let iconId = '#' + e.params.data.element.dataset.icon;

            currentBtn.find('span').text(selectedOptionData.text);
            currentBtn.find('.svg-icon use').attr('xlink:href', iconId);
        });

        if (!$parent.hasClass("hide-block")) {
            $parent.addClass("hide-block");
            $btn.removeClass("active");
            $(".wrap-options").parent().slideDown();
        }
    });
}

function watchOnSelect() {
    $('.select2').on('select2:select', function (e) {
        let selectedOption = e.params.data.text;
        let selectDataAttr = $(this).attr('data-select');
        let iconId = '#' + e.params.data.element.dataset.icon;

        $('.btn-option').each(function () {
            if ($(this).attr('data-button') === selectDataAttr) {
                $(this).find('span').text(selectedOption);
                $(this).find('.svg-icon use').attr('xlink:href', iconId);
            }
        });
    });
}

function sendContactsForm() {
    const form = $('.contacts-form');
    if ($(form).length === 0) return;

    const inputName = form.find('input[name="name"]'),
        inputEmail = form.find('input[name="email"]'),
        inputMessage = form.find('textarea[name="message"]'),
        formMessage = form.find('.form-message'),
        feedbackUrl = $(form).attr('data-url');

    let obj = {};

    $(form).on('submit', function (e) {
        e.preventDefault();

        if (inputName.val().length < 3) {
            formMessage.text('The name must be at least three letters long.');
            checkActiveClass();
            return;
        } else if (inputEmail.val().length === 0) {
            formMessage.text('The email field cannot be empty.');
            checkActiveClass();
            return;
        } else if (inputMessage.val().length === 0) {
            formMessage.text('The message field cannot be empty.');
            checkActiveClass();
            return;
        }

        function checkActiveClass() {
            if (!formMessage.hasClass('active')) {
                formMessage.addClass('active');
            }
        }

        formMessage.removeClass('active');
        $(form).append('<div class="custom-loader-holder"><div class="custom-loader"><div class="shadow"></div><div class="box"></div></div></div>');

        obj.name = inputName.val();
        obj.email = inputEmail.val();
        obj.message = inputMessage.val();

        const formData = JSON.stringify(obj);

        // abraham@gmail.com

        $.ajax({
            url: feedbackUrl,
            type: 'POST',
            data: formData,
            contentType: 'application/json',
            success: function (response) {
                // console.log('File uploaded successfully:', response);

                // console.log(response.message);

                $(form).find('.custom-loader-holder').remove();
                inputName.val('');
                inputEmail.val('');
                inputMessage.val('');
                formMessage.text('Your message has been successfully sent.');
                if (!formMessage.hasClass('active')) {
                    formMessage.addClass('active');
                }
                setTimeout(() => {
                    formMessage.removeClass('active');
                }, 5000);
            },
            error: function (error) {
                console.error('Error uploading file:', error);

                $(form).find('.custom-loader-holder').remove();
                formMessage.text('There was an error while sending the message, please try again later.');
                if (!formMessage.hasClass('active')) {
                    formMessage.addClass('active');
                }
                setTimeout(() => {
                    formMessage.removeClass('active');
                }, 7000);
            }
        });

    });
}

showInputActiveLine();
watchOnSelect();
changeSelectAfterBtnClick();
sendContactsForm();