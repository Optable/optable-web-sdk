<!doctype html>
<html>
  <head>
  </head>
  <body>
    <script>
      const params = new URLSearchParams(window.location.search);

      const color = params.get('color');
      const width = params.get('width');
      const height = params.get('height');
      const text = params.get('text');

      const ad = document.createElement('div');
      ad.style.width = width;
      ad.style.height = height;
      ad.style.backgroundColor = color;
      ad.style.display = 'flex';
      ad.style.justifyContent = 'center';
      ad.style.alignItems = 'center';

      const p = document.createElement('p');
      p.style.fontSize = '30px';
      p.style.color = color;
      p.style.filter = 'invert(1)';
      p.innerText = text;
      ad.appendChild(p);
      document.body.appendChild(ad);
    </script>
  </body>
</html>
