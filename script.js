document.addEventListener('DOMContentLoaded',()=>{
 const menu=document.querySelector('.menu-toggle'), links=document.querySelector('.navlinks');
 if(menu&&links) menu.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
 const toggle=document.querySelector('.search-toggle'), panel=document.querySelector('.search-panel');
 if(toggle&&panel) toggle.addEventListener('click',()=>{panel.classList.toggle('open');if(panel.classList.contains('open'))panel.querySelector('input')?.focus();});
 const year=document.querySelectorAll('[data-year]');year.forEach(el=>el.textContent=new Date().getFullYear());
 const search=document.querySelector('[data-blog-search]'), category=document.querySelector('[data-blog-category]'), rows=[...document.querySelectorAll('[data-post]')], empty=document.querySelector('[data-empty]');
 function filterPosts(){if(!rows.length)return;const q=(search?.value||'').toLowerCase().trim(), c=category?.value||'all';let count=0;rows.forEach(row=>{const matchQ=row.innerText.toLowerCase().includes(q),matchC=c==='all'||row.dataset.category===c;row.hidden=!(matchQ&&matchC);if(!row.hidden)count++;});if(empty)empty.style.display=count?'none':'block';}
 search?.addEventListener('input',filterPosts);category?.addEventListener('change',filterPosts);
 document.querySelectorAll('[data-contact-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form);const subject=encodeURIComponent('Nooreva website enquiry: '+(data.get('topic')||'General question'));const body=encodeURIComponent('Name: '+data.get('name')+'\\nEmail: '+data.get('email')+'\\nTopic: '+data.get('topic')+'\\n\\n'+data.get('message'));window.location.href='mailto:nooreva615@gmail.com?subject='+subject+'&body='+body;}));
});