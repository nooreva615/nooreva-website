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
// Nooreva CMS blog integration
(async function loadNoorevaPosts() {
    const postList = document.querySelector(".post-list");
    if (!postList) return;

    const emptyState = document.querySelector("[data-empty]");
    const searchInput = document.querySelector("[data-blog-search]");
    const categorySelect = document.querySelector("[data-blog-category]");

    const repoOwner = "nooreva615";
    const repoName = "nooreva-website";
    const branch = "main";

    const apiUrl =
        `https://api.github.com/repos/${repoOwner}/${repoName}/contents/blog-posts?ref=${branch}`;

    let posts = [];

    function getFrontmatter(content) {
        const match = content.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);

        if (!match) {
            return {
                meta: {},
                body: content
            };
        }

        const meta = {};

        match[1].split("\n").forEach(line => {
            const separator = line.indexOf(":");

            if (separator !== -1) {
                const key = line.slice(0, separator).trim();
                const value = line.slice(separator + 1).trim();

                meta[key] = value.replace(/^["']|["']$/g, "");
            }
        });

        return {
            meta,
            body: match[2]
        };
    }

    function escapeHTML(text) {
        return String(text || "").replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }

    function renderPosts() {
        const query = (searchInput?.value || "").toLowerCase().trim();
        const selectedCategory = categorySelect?.value || "all";

        const filteredPosts = posts.filter(post => {
            const matchesSearch =
                !query ||
                post.title.toLowerCase().includes(query) ||
                post.description.toLowerCase().includes(query);

            const matchesCategory =
                selectedCategory === "all" ||
                post.category.toLowerCase() === selectedCategory.toLowerCase();

            return matchesSearch && matchesCategory;
        });

        postList.innerHTML = filteredPosts.map(post => `
            <article class="post-row" data-post>
                <div class="post-thumb">
                    ${post.image
                        ? `<img src="${escapeHTML(post.image)}" alt="" style="width:100%;height:100%;object-fit:cover">`
                        : "Nooreva / Journal"}
                </div>

                <div>
                    <div class="article-meta">
                        ${escapeHTML(post.category)} · ${escapeHTML(post.date)}
                    </div>

                    <h3>
                        <a href="post.html?slug=${encodeURIComponent(post.slug)}">
                            ${escapeHTML(post.title)}
                        </a>
                    </h3>

                    <p>${escapeHTML(post.description)}</p>

                    <a class="text-link"
                       href="post.html?slug=${encodeURIComponent(post.slug)}">
                        Read article ↗
                    </a>
                </div>
            </article>
        `).join("");

        if (emptyState) {
            emptyState.style.display = filteredPosts.length ? "none" : "block";
        }
    }

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Could not load GitHub blog posts");
        }

        const files = await response.json();

        const markdownFiles = files.filter(file =>
            file.name.endsWith(".md")
        );

        posts = await Promise.all(
            markdownFiles.map(async file => {
                const response = await fetch(file.download_url);
                const content = await response.text();

                const parsed = getFrontmatter(content);
                const meta = parsed.meta;

                return {
                    title: meta.title || file.name,
                    date: meta.date || "",
                    category: meta.category || "General",
                    description: meta.description || "",
                    image: meta.image || "",
                    body: parsed.body,
                    slug: file.name.replace(".md", "")
                };
            })
        );

        posts.sort((a, b) => b.date.localeCompare(a.date));

        renderPosts();

        searchInput?.addEventListener("input", renderPosts);
        categorySelect?.addEventListener("change", renderPosts);

    } catch (error) {
        console.error(error);

        postList.innerHTML = `
            <p>Blog posts could not load. Please refresh the page.</p>
        `;
    }
})();
