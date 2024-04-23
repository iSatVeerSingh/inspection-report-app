<p>
  A new item suggestion by Inspector {{ $inspector }}
</p>
<p>
  <b>Category:</b> {{ $item['category'] }}
</p>
<p>
  <b>Name:</b> {{ $item['name'] }}
</p>
<p>
  <b>Opening Paragraph:</b> {{ $item['opening_paragraph'] }}
</p>
<p>
  <b>Closing Paragraph:</b> {{ $item['closing_paragraph'] }}
</p>
@if (array_key_exists('embedded_image', $item))
<div>
  <b>Embedded Image:</b>
  <img src="{{ $message->embedData(base64_decode(explode(',', $item['embedded_image'])[1]), 'embedded-image.jpg') }}">
</div>
@endif