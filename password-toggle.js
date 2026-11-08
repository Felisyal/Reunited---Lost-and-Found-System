
(function () {
    var EYE =
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    var EYE_OFF =
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>' +
        '<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>' +
        '<path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

    var css =
        '.pw-wrap{position:relative;display:block;width:100%;}' +
        '.pw-wrap input{width:100% !important;box-sizing:border-box !important;padding-right:44px !important;}' +
        '.pw-wrap .pw-toggle,.login-form .pw-wrap .pw-toggle{' +
        'position:absolute;top:50%;right:10px;transform:translateY(-50%);' +
        'width:auto !important;height:auto;margin:0 !important;padding:4px !important;' +
        'background:transparent !important;border:none !important;box-shadow:none !important;' +
        'color:#888 !important;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:0;}' +
        '.pw-wrap .pw-toggle:hover,.pw-wrap .pw-toggle:focus-visible{color:maroon !important;background:transparent !important;}' +
        '.pw-wrap .pw-toggle:focus-visible{outline:2px solid maroon;outline-offset:2px;border-radius:4px;}';

    function addStyles() {
        if (document.getElementById('pw-toggle-styles')) return;
        var style = document.createElement('style');
        style.id = 'pw-toggle-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function enhance(input) {
        if (input.dataset.pwToggle) return;
        input.dataset.pwToggle = '1';

        var wrap = document.createElement('span');
        wrap.className = 'pw-wrap';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);

        var btn = document.createElement('button');
        btn.type = 'button'; 
        btn.className = 'pw-toggle';
        btn.setAttribute('aria-label', 'Show password');
        btn.innerHTML = EYE;
        wrap.appendChild(btn);

        btn.addEventListener('click', function () {
            var show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            btn.innerHTML = show ? EYE_OFF : EYE;
            btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
            input.focus();
        });
    }

    function init() {
        addStyles();
        document.querySelectorAll('input[type="password"]').forEach(enhance);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
