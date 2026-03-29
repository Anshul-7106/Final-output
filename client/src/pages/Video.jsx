import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";

const Video = ({ user }) => {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ad Modal State
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(10);
  const [canSkipAd, setCanSkipAd] = useState(false);
  const [pendingVideoUrl, setPendingVideoUrl] = useState(null);
  const [searchResults, setSearchResults] = useState({ folders: [], notes: [] });
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);

  const navigate = useNavigate();

  // Handle clicking outside the search box
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchResults({ folders: [], notes: [] });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Admin states
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  // Define authorized administrator emails here
  const ADMIN_EMAILS = ["admin@gmail.com", "sudhanshray10@gmail.com","vs5825982@gmail.com"];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', description: '', youtube_url: '', file: null });
  const fileInputRef = useRef(null);



  const fetchContent = () => {
    setLoading(true);
    const folderQuery = currentFolderId ? `?parent_id=${currentFolderId}&category=video` : `?category=video`;
    const noteQuery = currentFolderId ? `?folder_id=${currentFolderId}&category=video` : `?category=video`;

    Promise.all([
      fetch(`/api/folders${folderQuery}`).then(res => res.json()),
      fetch(`/api/notes${noteQuery}`).then(res => res.json())
    ])
    .then(([foldersData, notesData]) => {
      setFolders(Array.isArray(foldersData) && !foldersData.error ? foldersData : []);
      setNotes(Array.isArray(notesData) && !notesData.error ? notesData : []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchContent();
  }, [currentFolderId]);

  // Video Player Logic
  const handleWatchClick = (note) => {
    const urlToPlay = note.file_url || note.youtube_url;
    setPendingVideoUrl(urlToPlay);
    setAdCountdown(10);
    setCanSkipAd(false);
    setAdModalOpen(true);
  };
  
  const handleSkipAd = () => {
    setAdModalOpen(false);
    setSelectedVideoUrl(pendingVideoUrl);
    setPendingVideoUrl(null);
  };

  useEffect(() => {
    let timer;
    if (adModalOpen && adCountdown > 0) {
      timer = setTimeout(() => {
        setAdCountdown(prev => prev - 1);
      }, 1000);
    } else if (adModalOpen && adCountdown === 0) {
      setCanSkipAd(true);
    }
    return () => clearTimeout(timer);
  }, [adModalOpen, adCountdown]);
  
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        const videoId = match[2];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}`;
      }
    } catch(e) {}
    return url;
  };

  const handleLogout = () => {
    auth.signOut().then(() => navigate('/login'));
  };

  // Search effect
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (!searchQuery.trim()) {
      setSearchResults({ folders: [], notes: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&category=video`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  // Handle Note Deletion
  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to completely delete this video resource?")) return;
    try {
      const res = await fetch(`/api/notes/delete/${id}`, { 
        method: 'DELETE',
        headers: {
          'x-user-email': user?.email || ''
        }
      });
      if (res.ok) {
        setNotes(notes.filter(note => note.id !== id));
      } else {
        alert("Failed to delete note. Ensure the server is running.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting note.");
    }
  };

  // Handle Note Addition
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.title || !addForm.description || !addForm.youtube_url) {
      alert("Please provide a title, description, and a Youtube URL.");
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', addForm.title);
    formData.append('description', addForm.description);
    formData.append('youtube_url', addForm.youtube_url);
    formData.append('category', 'video');
    if (currentFolderId) {
      formData.append('folder_id', currentFolderId);
    }

    try {
      const res = await fetch("/api/notes/add-video", {
        method: "POST",
        body: formData,
        headers: {
          'x-user-email': user?.email || ''
        }
      });
      if (res.ok) {
        const newNote = await res.json();
        // Add new note to top of the list
        setNotes([newNote, ...notes]);
        setIsAddModalOpen(false);
        // Reset form
        setAddForm({ title: '', description: '', youtube_url: '', file: null });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        alert("Failed to upload note! Please check server logs.");
      }
    } catch (err) {
      console.error(err);
      alert("Error linking to server for upload.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFolderSubmit = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch("/api/folders/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.email || ""
        },
        body: JSON.stringify({
          name: newFolderName,
          parent_id: currentFolderId,
          category: 'video'
        })
      });
      if (res.ok) {
        const newFolder = await res.json();
        setFolders([...folders, newFolder]);
        setIsAddFolderModalOpen(false);
        setNewFolderName("");
      } else {
        alert("Failed to create folder");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFolderClick = (folder) => {
    setFolderHistory([...folderHistory, folder]);
    setCurrentFolderId(folder.id);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setFolderHistory([]);
      setCurrentFolderId(null);
    } else {
      const newHistory = folderHistory.slice(0, index + 1);
      setFolderHistory(newHistory);
      setCurrentFolderId(newHistory[index].id);
    }
  };

  const handleBackClick = () => {
    if (folderHistory.length > 1) {
      handleBreadcrumbClick(folderHistory.length - 2);
    } else {
      handleBreadcrumbClick(-1); // Back to root Home
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this folder and all its contents?")) return;
    try {
      const res = await fetch(`/api/folders/delete/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-email': user?.email || '' }
      });
      if (res.ok) {
        setFolders(folders.filter(f => f.id !== id));
      } else {
        alert("Failed to delete folder.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 font-sans pb-16 transition-colors duration-300">
      {/* Navigation Bar */}
      <Navbar 
        user={user} 
        isAdmin={isAdmin} 
        onLogout={handleLogout} 
        searchBar={
          <div className="relative ml-4" ref={searchContainerRef}>
            <div className="flex items-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full px-4 py-1.5 focus-within:border-yellow-500/50 focus-within:ring-1 focus-within:ring-yellow-500/30 transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 dark:text-zinc-500 mr-2 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text" 
                placeholder="Search videos, folders..." 
                className="bg-transparent text-sm w-48 lg:w-64 text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none transition-colors duration-300"
                value={searchQuery}
                // Clear the results if input is emptied
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if(!e.target.value) setSearchResults({ folders: [], notes: [] });
                }}
                onFocus={() => {
                  if (searchQuery && (searchResults.folders.length > 0 || searchResults.notes.length > 0)) {
                    // Re-open if they click back in
                    setSearchQuery(searchQuery + ' ');
                    setTimeout(() => setSearchQuery(searchQuery), 0);
                  }
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults({ folders: [], notes: [] });
                  }}
                  className="p-1 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors ml-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
              {isSearching && (
                <svg className="animate-spin h-4 w-4 text-yellow-500 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              )}
            </div>

            {/* Dropdown Suggestions */}
            {searchQuery.trim().length > 0 && (searchResults.folders.length > 0 || searchResults.notes.length > 0) && (
              <div className="absolute top-full left-0 mt-2 w-full min-w-[300px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-[100] max-h-96 overflow-y-auto transition-colors duration-300">
                
                {/* Folder Results */}
                {searchResults.folders.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1 text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider transition-colors duration-300">Folders</div>
                    {searchResults.folders.map(f => (
                      <button 
                        key={`search-folder-${f.id}`} 
                        onClick={() => {
                          setSearchQuery('');
                          setFolderHistory([{ id: f.id, name: f.name }]); // Reset history to jump directly to this folder
                          setCurrentFolderId(f.id);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                      >
                        <div className="p-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 transition-colors duration-300">{f.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Notes Results */}
                {searchResults.notes.length > 0 && (
                  <div className="py-2 border-t border-gray-100 dark:border-zinc-800 transition-colors duration-300">
                    <div className="px-4 py-1 text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider transition-colors duration-300">Resources</div>
                    {searchResults.notes.map(n => (
                      <button 
                        key={`search-note-${n.id}`} 
                        onClick={() => {
                          setSearchQuery('');
                          handleWatchClick(n);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-start gap-3 transition-colors"
                      >
                        <div className="p-1.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 rounded-md mt-0.5 transition-colors duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 leading-tight transition-colors duration-300">{n.title}</span>
                          {n.description && <span className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-1 mt-0.5 transition-colors duration-300">{n.description}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        } 
      />

      {/* Hero Section */}
      <div className="bg-[#FAF9F6] dark:bg-zinc-950 py-16 md:py-24 relative overflow-hidden text-left border-b border-gray-100 dark:border-zinc-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-3xl">
            <h4 className="text-yellow-600 font-bold tracking-widest text-sm mb-4 uppercase flex items-center gap-2">
              <span className="w-8 h-px bg-yellow-600"></span> VIDEO LECTURES
            </h4>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight text-gray-900 dark:text-white leading-tight transition-colors duration-300">
              Premium Courses,<br/>
              <span className="text-yellow-500">Unlocked by Learning</span>
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed transition-colors duration-300">
              Immerse yourself in our comprehensive video library tailored for deep understanding.
            </p>
          </div>
          <div>
            <button className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 font-bold py-3 px-8 rounded-lg tracking-widest text-sm uppercase transition-colors shadow-sm bg-white">
              VIEW ALL VIDEOS
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-8 overflow-x-auto pb-2">
          <button onClick={() => handleBreadcrumbClick(-1)} className="hover:text-yellow-600 transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Home
          </button>
          {folderHistory.map((folder, index) => (
            <div key={folder.id} className="flex items-center gap-2">
              <span className="text-gray-300">/</span>
              <button 
                onClick={() => handleBreadcrumbClick(index)} 
                className={`hover:text-yellow-600 transition-colors truncate max-w-[150px] ${index === folderHistory.length - 1 ? 'text-yellow-600 font-bold' : ''}`}
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            {currentFolderId && (
              <button 
                onClick={handleBackClick} 
                className="bg-white hover:bg-zinc-100 text-zinc-700 p-2 rounded-xl transition-colors flex items-center justify-center shadow-sm border border-zinc-200"
                title="Go Back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Videos & Folders
            </h2>
          </div>

          {/* Admin Action Buttons */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setIsAddFolderModalOpen(true)}
                className="bg-white text-zinc-900 border border-gray-200 hover:border-yellow-500 hover:text-yellow-600 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                New Folder
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-zinc-900 hover:bg-black text-yellow-500 border border-yellow-500/30 hover:border-yellow-500 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Upload Video
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl h-64 border border-gray-100 p-6 animate-pulse flex flex-col justify-between shadow-sm">
                <div>
                  <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-full mb-2"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : folders.length === 0 && notes.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto mt-8 relative overflow-hidden">
            <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-yellow-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">No videos available in this folder</h3>
            <p className="text-gray-500 text-lg leading-relaxed">Check back later or contact your instructor to upload video lectures here.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* Render Folders as Unique "Stacks" */}
            {folders.map(folder => (
              <div 
                key={`folder-${folder.id}`}
                onClick={() => handleFolderClick(folder)}
                className="group relative cursor-pointer"
              >
                {/* Background stack effect */}
                <div className="absolute inset-0 bg-yellow-400/20 rounded-[2rem] translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500"></div>
                <div className="absolute inset-0 bg-white border border-gray-100 rounded-[2rem] translate-x-1 translate-y-1 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-500 shadow-sm border-b-2 border-r-2 border-gray-200/50"></div>
                
                {/* Main Card */}
                <div className="relative bg-[#ffffff] dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 group-hover:border-yellow-300 dark:group-hover:border-yellow-500 rounded-[2rem] p-6 shadow-sm group-hover:shadow-[0_8px_30px_rgba(234,179,8,0.12)] transition-all duration-300 overflow-hidden flex flex-col h-full min-h-[160px]">
                  {/* Subtle Glow */}
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-400 opacity-0 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-700"></div>

                  <div className="flex justify-between items-start mb-4">
                    {/* Collection Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    {/* Badge */}
                    <span className="text-[10px] font-bold text-yellow-600/80 bg-yellow-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-yellow-100">Library</span>
                  </div>

                  <div className="mt-auto">
                    <h3 className="text-[19px] font-black text-gray-900 dark:text-white group-hover:text-yellow-600 transition-colors line-clamp-1 mb-1">{folder.name}</h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                      Open Collection
                    </p>
                  </div>

                  {isAdmin && (
                    <button 
                      onClick={(e) => handleDeleteFolder(folder.id, e)}
                      className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 rounded-xl transition-all z-20 opacity-0 group-hover:opacity-100"
                      title="Delete Collection"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Render Videos as Modern Reference Cards */}
            {notes.map((note) => {
               const colorCombos = [
                 "from-red-400 to-red-600",
                 "from-indigo-400 to-indigo-600",
                 "from-cyan-400 to-cyan-600",
                 "from-pink-400 to-pink-600",
                 "from-yellow-400 to-yellow-600"
               ];
               const iconColor = colorCombos[Math.abs(String(note.id || "").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colorCombos.length];

               return (
                <div
                  key={`note-${note.id}`}
                  onClick={() => handleWatchClick(note)}
                  className="group bg-white dark:bg-zinc-800 rounded-[2rem] shadow-[0_2px_15px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-zinc-700 hover:border-yellow-200 dark:hover:border-yellow-500/50 overflow-hidden flex flex-col transition-all duration-500 transform hover:-translate-y-2 relative cursor-pointer p-7"
                >
                  <div className="flex justify-between items-start mb-8">
                    {/* Unique Play Icon */}
                    <div className="relative w-12 h-12 group-hover:scale-110 transition-transform duration-500">
                       <div className={`w-12 h-12 bg-gradient-to-br ${iconColor} rounded-2xl shadow-md flex items-center justify-center relative overflow-hidden`}>
                         <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                         {/* Shine effect */}
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                       </div>
                       {/* Subtle shadow glow */}
                       <div className={`absolute inset-0 bg-gradient-to-br ${iconColor} blur-lg opacity-20 -z-10`}></div>
                    </div>

                    {/* Status Tag */}
                    <div className="flex items-center text-[10px] font-black text-gray-400/80 gap-1.5 uppercase tracking-widest bg-gray-50/50 px-2.5 py-1.5 rounded-full border border-gray-100 transition-colors group-hover:bg-yellow-50 group-hover:text-yellow-600 group-hover:border-yellow-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                      Watch Lecture
                    </div>
                  </div>

                  <h3 className="font-black text-gray-900 dark:text-white mb-2.5 text-[18px] leading-tight group-hover:text-yellow-600 transition-colors line-clamp-2">{note.title}</h3>
                  <p className="text-[13px] leading-relaxed text-gray-500 dark:text-zinc-400 font-medium line-clamp-2 min-h-[40px] mb-8 transition-colors duration-300">{note.description}</p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50 dark:border-zinc-700/50 flex justify-between items-center transition-colors duration-300">
                    <span className="text-[11px] font-black text-yellow-600 tracking-[0.1em] uppercase">{note.category || "LECTURE"}</span>
                    <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-widest gap-2 group-hover:text-yellow-600 transition-colors">
                      Stream Now
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                  </div>

                  {/* Admin Delete */}
                  {isAdmin && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                      className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-red-500 bg-red-50 p-2 rounded-xl transition-all z-20 hover:bg-red-100 shadow-sm"
                      title="Delete Video"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
               );
            })}
          </div>
        )}
      </main>
      
      {/* YouTube Ad Modal */}
      {adModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-zinc-950 w-full max-w-4xl aspect-video rounded-2xl shadow-2xl flex flex-col border border-yellow-500/20 overflow-hidden relative transform transition-all">
            
            <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
              <div className="w-12 h-12 bg-black/50 rounded-full border border-yellow-500/50 flex flex-col items-center justify-center shadow-lg backdrop-blur-sm p-1">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Branding Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display='none'; }}/>
              </div>
              <span className="text-white font-black text-lg tracking-wider drop-shadow-md hidden sm:block">Encore Ascend</span>
            </div>

            <div className="w-full h-full relative">
              <iframe 
                width="100%" 
                height="100%" 
                src={"https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1"} 
                title="Advertisement"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
              ></iframe>
            </div>

            <div className="absolute bottom-6 right-6 z-10 transition-all duration-300">
              {canSkipAd ? (
                <button 
                  onClick={handleSkipAd}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-full font-bold shadow-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95 border border-yellow-300 pointer-events-auto"
                >
                  Skip Ad
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              ) : (
                <div className="bg-black/80 backdrop-blur-sm text-gray-300 px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-3 border border-gray-600/50 pointer-events-none">
                  <span className="text-yellow-500 text-sm tracking-widest uppercasemr-2">Advertisement</span>
                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Skip Ad in {adCountdown}s
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Video Player Modal */}
      {selectedVideoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-zinc-950 w-full max-w-5xl aspect-video rounded-2xl shadow-2xl flex flex-col border border-yellow-500/20 overflow-hidden relative transform transition-all">
            
            {/* Branding Logo overlay */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
              <div className="w-12 h-12 bg-black/50 rounded-full border border-yellow-500/50 flex flex-col items-center justify-center shadow-lg backdrop-blur-sm p-1">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Branding Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display='none'; }}/>
              </div>
              <span className="text-white font-black text-lg tracking-wider drop-shadow-md hidden sm:block">Encore Ascend</span>
            </div>

            {/* Close Button overlay */}
            <div className="absolute top-6 right-6 z-10 flex gap-3">
              <button onClick={() => setSelectedVideoUrl(null)} className="text-zinc-300 hover:text-red-500 hover:bg-red-500/10 transition-colors p-3 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-zinc-700" title="Close Video">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Unified Native Player Wrapper */}
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              
              {/* Invisible overlay to block YouTube top bar clicks (Watch Later, Share, Title link) */}
              {(selectedVideoUrl?.includes("youtube.com") || selectedVideoUrl?.includes("youtu.be")) && (
                <div 
                  className="absolute top-0 left-0 w-full h-16 z-20 bg-transparent cursor-not-allowed" 
                  title="External actions restricted"
                  onContextMenu={(e) => e.preventDefault()}
                ></div>
              )}

              {selectedVideoUrl?.includes("youtube.com") || selectedVideoUrl?.includes("youtu.be") ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={getYouTubeEmbedUrl(selectedVideoUrl)} 
                  title="YouTube Video"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  className="w-full h-full outline-none"
                ></iframe>
              ) : (
                <video 
                  src={selectedVideoUrl}
                  controls
                  className="w-full h-full object-contain outline-none drop-shadow-2xl"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Admin Add Folder Modal */}
      {isAdmin && isAddFolderModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden relative transform transition-all border border-gray-100">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                Create Folder
              </h3>
              <button onClick={() => setIsAddFolderModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors shadow-sm border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddFolderSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Folder Name</label>
                <input 
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Unit 1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all font-medium"
                  required
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-zinc-900 hover:bg-black text-yellow-500 font-bold py-3 rounded-xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 mt-2"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add Note Modal */}
      {isAdmin && isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden relative transform transition-all border border-gray-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Upload Video Lecture
              </h3>
              <button disabled={isSubmitting} onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors shadow-sm border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Video Title</label>
                <input 
                  type="text" 
                  value={addForm.title}
                  onChange={e => setAddForm({...addForm, title: e.target.value})}
                  placeholder="e.g. Advanced Calculus Lecture 1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                  value={addForm.description}
                  onChange={e => setAddForm({...addForm, description: e.target.value})}
                  placeholder="Briefly describe the contents of this video..."
                  rows="3"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all font-medium resize-none"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">YouTube Video Link (Unlisted)</label>
                <input 
                  type="url" 
                  value={addForm.youtube_url}
                  onChange={e => setAddForm({...addForm, youtube_url: e.target.value})}
                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all font-medium"
                  required
                />
              </div>
              <div className="pt-4 mt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-zinc-900 hover:bg-black text-yellow-500 font-bold py-3.5 rounded-xl shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  {isSubmitting ? (
                    <><svg className="animate-spin h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Uploading Video...</>
                  ) : "Upload Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;
