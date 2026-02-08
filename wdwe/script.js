const supabaseUrl = 'https://yuavjgxxxdzrtvukapsk.supabase.co';
const supabaseKey = 'sb_publishable_YRCbQcM8E0bhLIk1JUy9nw_PSFASmo7';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let currentUser = null;

// Check auth state on load
async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  if (user) {
    document.getElementById('post-link')?.style.display = 'block';
    document.getElementById('logout-btn')?.style.display = 'block';
  }
}

// Signup
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const isSignup = document.getElementById('is-signup').checked;

  let result;
  if (isSignup) {
    result = await supabase.auth.signUp({ email, password });
    document.getElementById('auth-message').textContent = result.error 
      ? result.error.message 
      : 'Check your email to confirm signup!';
  } else {
    result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      document.getElementById('auth-message').textContent = result.error.message;
    } else {
      window.location.href = 'index.html';
    }
  }
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.reload();
});

// Fetch and display posts
async function fetchPosts() {
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
  if (error) console.error(error);
  const container = document.getElementById('posts-container');
  container.innerHTML = '';
  data.forEach(post => {
    const div = document.createElement('div');
    div.classList.add('post');
    div.innerHTML = `<h2>${post.title}</h2><p>${post.body}</p><small>Posted on ${new Date(post.created_at).toLocaleString()}</small>`;
    container.appendChild(div);
  });
}

// Create post
document.getElementById('post-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) {
    document.getElementById('post-message').textContent = 'Please login first.';
    return;
  }
  const title = document.getElementById('title').value;
  const body = document.getElementById('body').value;
  const { error } = await supabase.from('posts').insert({ title, body, user_id: currentUser.id });
  if (error) {
    document.getElementById('post-message').textContent = error.message;
  } else {
    window.location.href = 'index.html';
  }
});

// On page load
window.addEventListener('load', async () => {
  await checkAuth();
  if (document.getElementById('posts-container')) fetchPosts();
  
});