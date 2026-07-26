document.addEventListener('DOMContentLoaded', function () {
  var sparkleField = document.getElementById('sparkles');
  if (sparkleField) {
    var count = 40;
    for (var i = 0; i < count; i++) {
      var s = document.createElement('div');
      s.className = 'sparkle';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDuration = (2 + Math.random() * 4) + 's';
      s.style.animationDelay = (Math.random() * 6) + 's';
      sparkleField.appendChild(s);
    }
  }

  var alerts = document.querySelectorAll('.alert');
  alerts.forEach(function (a) {
    setTimeout(function () {
      a.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      a.style.opacity = '0';
      a.style.transform = 'translateY(-8px)';
      setTimeout(function () { a.remove(); }, 400);
    }, 5000);
  });
});
