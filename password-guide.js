
(function () {
    var FIELDS = [
        'admin_register_password',
        'student_register_password',
        'staff_register_password'
    ];

    var RULES = [
        { text: 'At least 8 characters',            test: function (v) { return v.length >= 8; } },
        { text: 'One uppercase letter (A-Z)',       test: function (v) { return /[A-Z]/.test(v); } },
        { text: 'One lowercase letter (a-z)',       test: function (v) { return /[a-z]/.test(v); } },
        { text: 'One number (0-9)',                 test: function (v) { return /[0-9]/.test(v); } },
        { text: 'One special character (_ ! @ #)',  test: function (v) { return /[^A-Za-z0-9]/.test(v); } }
    ];

    var css =
        '.pw-guide{list-style:none;margin:2px 0 8px;padding:10px 12px;text-align:left;' +
        'background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;font-size:12px;' +
        "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;display:none;}" +
        '.pw-guide.show{display:block;}' +
        '.pw-guide li{display:flex;align-items:center;gap:8px;color:#6b7280;padding:2px 0;}' +
        '.pw-guide li::before{content:"\\2715";display:inline-flex;align-items:center;justify-content:center;' +
        'width:16px;height:16px;border-radius:50%;background:#fee2e2;color:#b91c1c;font-size:10px;flex-shrink:0;}' +
        '.pw-guide li.ok{color:#15803d;}' +
        '.pw-guide li.ok::before{content:"\\2713";background:#dcfce7;color:#15803d;}';

    function addStyles() {
        if (document.getElementById('pw-guide-styles')) return;
        var style = document.createElement('style');
        style.id = 'pw-guide-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function attach(input) {
        var list = document.createElement('ul');
        list.className = 'pw-guide';
        list.setAttribute('aria-live', 'polite');

        var items = RULES.map(function (rule) {
            var li = document.createElement('li');
            li.textContent = rule.text;
            list.appendChild(li);
            return li;
        });

        var anchor = input.closest('.pw-wrap') || input;
        anchor.parentNode.insertBefore(list, anchor.nextSibling);

        function update() {
            var value = input.value;
            var allOk = true;
            RULES.forEach(function (rule, i) {
                var ok = rule.test(value);
                items[i].classList.toggle('ok', ok);
                if (!ok) allOk = false;
            });
            input.setCustomValidity(allOk || value === '' ? '' : 'Please meet all password requirements.');
        }

        input.addEventListener('input', update);
        input.addEventListener('focus', function () { list.classList.add('show'); });
        input.addEventListener('blur', function () {
            if (input.value === '') list.classList.remove('show');
        });
        update();
    }

    function init() {
        addStyles();
        FIELDS.forEach(function (name) {
            document.querySelectorAll('input[name="' + name + '"]').forEach(attach);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
