---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---

{% for page in site.pages %}
{% if page.layout == "song" %}
[{{ page.title }}]({{ page.url | relative_url }})
{% endif %}
{% endfor %}
