import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";

const Notes = ({ user }) => {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoCountdown, setVideoCountdown] = useState(10);
  const [canSkipVideo, setCanSkipVideo] = useState(false);
  const [pendingPdfUrl, setPendingPdfUrl] = useState(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  const buildViewerSrc = (url) => {
    if (!url) return "";
    const normalizedUrl = url.trim();
    const lowerUrl = normalizedUrl.toLowerCase();
    const isPdf = lowerUrl.includes(".pdf");
    return isPdf
      ? `${normalizedUrl}#toolbar=0&navpanes=0`
      : `https://docs.google.com/viewer?url=${encodeURIComponent(normalizedUrl)}&embedded=true`;
  };

  const fetchContent = () => {
    setLoading(true);
    const folderQuery = currentFolderId ? `?parent_id=${currentFolderId}` : '';
    const noteQuery = currentFolderId ? `?folder_id=${currentFolderId}` : '';

    Promise.all([
      fetch(`/api/folders${folderQuery}`).then(res => res.json()),
      fetch(`/api/notes${noteQuery}`).then(res => res.json())
    ])
    .then(([foldersData, notesData]) => {
      let finalFolders = Array.isArray(foldersData) && !foldersData.error ? foldersData : [];
      let finalNotes = Array.isArray(notesData) && !notesData.error ? notesData : [];

      // Add dummy UPSC folder if at root
      const dummyFolderId = "upsc-dummy-9999";
      if (!currentFolderId) {
        if (!finalFolders.find(f => f.id === dummyFolderId)) {
          finalFolders.push({ id: dummyFolderId, name: "UPSC (General knowledge)", parent_id: null });
        }
      }

      // Add dummy UPSC note if inside the dummy folder or if notes list is being populated
      if (currentFolderId === dummyFolderId) {
        if (!finalNotes.find(n => n.id === "upsc-note-9999")) {
          finalNotes.push({
            id: "upsc-note-9999",
            title: "UPSC General Knowledge - Module 1",
            description: "A comprehensive introductory guide to Indian Polity, Modern History, and current affairs. Essential for Prelims.",
            file_url: "/GK.pdf",
            youtube_url: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
            category: "UPSC",
            folder_id: dummyFolderId
          });
        }
      }

      setFolders(finalFolders);
      setNotes(finalNotes);
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

  // Helper to extract YouTube ID
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Video Intro Logic
  const handleReadClick = (note) => {
    // Track views (Analytics Placeholder)
    console.log("Analytics: PDF Read Tracked for URL:", note.file_url);
    setPendingPdfUrl(note.file_url);
    
    // Play a generic fake ad (Grammarly/Skillshare type dummy) or a 10s countdown video
    setActiveVideoUrl(`https://www.youtube.com/embed/LXb3EKWsInQ`);
    
    setVideoCountdown(10);
    setCanSkipVideo(false);
    setVideoModalOpen(true);
  };

  const handleSkipVideo = () => {
    setVideoModalOpen(false);
    setSelectedPdf(pendingPdfUrl);
    setPendingPdfUrl(null);
  };

  useEffect(() => {
    let timer;
    if (videoModalOpen && videoCountdown > 0) {
      timer = setTimeout(() => {
        setVideoCountdown(prev => prev - 1);
      }, 1000);
    } else if (videoModalOpen && videoCountdown === 0) {
      setCanSkipVideo(true);
    }
    return () => clearTimeout(timer);
  }, [videoModalOpen, videoCountdown]);

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
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&category=notes`);
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
    if (!window.confirm("Are you sure you want to completely delete this resource?")) return;
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
    if (!addForm.title || !addForm.description || !addForm.file) {
      alert("Please fill all fields and select a valid PDF file.");
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', addForm.title);
    formData.append('description', addForm.description);
    if(addForm.youtube_url) formData.append('youtube_url', addForm.youtube_url);
    formData.append('file', addForm.file);
    if (currentFolderId) {
      formData.append('folder_id', currentFolderId);
    }

    try {
      const res = await fetch("/api/notes/add", {
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
          parent_id: currentFolderId
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
                placeholder="Search resources, folders..." 
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
                          handleReadClick(n);
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
              <span className="w-8 h-px bg-yellow-600"></span> STUDY NOTES
            </h4>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight text-gray-900 dark:text-white leading-tight transition-colors duration-300">
              Curated Notes,<br/>
              <span className="text-yellow-500">Unlocked by Learning</span>
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed transition-colors duration-300">
              Watch a short video, then unlock premium notes — knowledge earned is knowledge retained.
            </p>
          </div>
          <div>
            <button className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 font-bold py-3 px-8 rounded-lg tracking-widest text-sm uppercase transition-colors shadow-sm bg-white">
              VIEW ALL NOTES
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              Resources & Folders
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
                Upload Resource
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
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">No resources available in this folder</h3>
            <p className="text-gray-500 text-lg leading-relaxed">Check back later or contact your instructor for access to the latest study materials and assignments.</p>
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
                    <span className="text-[10px] font-bold text-yellow-600/80 bg-yellow-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-yellow-100">Module</span>
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

            {/* Render Notes as Modern Reference Cards */}
            {notes.map((note) => {
               const colorCombos = [
                 "from-green-400 to-green-600",
                 "from-blue-400 to-blue-600",
                 "from-orange-400 to-orange-600",
                 "from-purple-400 to-purple-600",
                 "from-yellow-400 to-yellow-600"
               ];
               const iconColor = colorCombos[Math.abs(String(note.id || "").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colorCombos.length];

               return (
                <div
                  key={`note-${note.id}`}
                  onClick={() => handleReadClick(note)}
                  className="group bg-white dark:bg-zinc-800 rounded-[2rem] shadow-[0_2px_15px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-zinc-700 hover:border-yellow-200 dark:hover:border-yellow-500/50 overflow-hidden flex flex-col transition-all duration-500 transform hover:-translate-y-2 relative cursor-pointer p-7"
                >
                  <div className="flex justify-between items-start mb-8">
                    {/* Unique Book Icon */}
                    <div className="relative w-11 h-13 group-hover:scale-110 transition-transform duration-500">
                       <div className={`w-10 h-12 bg-gradient-to-br ${iconColor} rounded-sm shadow-md relative overflow-hidden`}>
                         {/* Pages detail */}
                         <div className="absolute top-0 right-0 w-3 h-3 bg-white/30 rounded-bl-sm"></div>
                         <div className="mt-7 ml-2 w-5 h-0.5 bg-white/40 rounded-full"></div>
                         <div className="mt-1 ml-2 w-3 h-0.5 bg-white/40 rounded-full"></div>
                       </div>
                       {/* Subtle shadow glow */}
                       <div className={`absolute inset-0 bg-gradient-to-br ${iconColor} blur-lg opacity-20 -z-10`}></div>
                    </div>

                    {/* Status Tag */}
                    <div className="flex items-center text-[10px] font-black text-gray-400/80 gap-1.5 uppercase tracking-widest bg-gray-50/50 px-2.5 py-1.5 rounded-full border border-gray-100 transition-colors group-hover:bg-yellow-50 group-hover:text-yellow-600 group-hover:border-yellow-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                      Watch to Unlock
                    </div>
                  </div>

                  <h3 className="font-black text-gray-900 dark:text-white mb-2.5 text-[18px] leading-tight group-hover:text-yellow-600 transition-colors line-clamp-2">{note.title}</h3>
                  <p className="text-[13px] leading-relaxed text-gray-500 dark:text-zinc-400 font-medium line-clamp-2 min-h-[40px] mb-8 transition-colors duration-300">{note.description}</p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50 dark:border-zinc-700/50 flex justify-between items-center transition-colors duration-300">
                    <span className="text-[11px] font-black text-yellow-600 tracking-[0.1em] uppercase">{note.category || "GENERAL"}</span>
                    <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-widest gap-2 group-hover:text-yellow-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      10s Intro
                    </div>
                  </div>

                  {/* Admin Delete */}
                  {isAdmin && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                      className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-red-500 bg-red-50 p-2 rounded-xl transition-all z-20 hover:bg-red-100 shadow-sm"
                      title="Delete Note"
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
      
      {/* YouTube Video Intro Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-zinc-950 w-full max-w-4xl aspect-video rounded-2xl shadow-2xl flex flex-col border border-yellow-500/20 overflow-hidden relative transform transition-all">
            
            {/* Branding Logo overlay */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
              <div className="w-12 h-12 bg-black/50 rounded-full border border-yellow-500/50 flex flex-col items-center justify-center shadow-lg backdrop-blur-sm p-1">
                <img src="/logo.png" alt="Branding Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display='none'; }}/>
              </div>
              <span className="text-white font-black text-lg tracking-wider drop-shadow-md hidden sm:block">Encore Ascend</span>
            </div>

            {/* YouTube iframe */}
            <div className="w-full h-full relative">
              <iframe 
                width="100%" 
                height="100%" 
                src={`${activeVideoUrl}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&loop=1&playlist=${activeVideoUrl.split('/').pop()}`} 
                title="Sponsor Video"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
              ></iframe>
            </div>

            {/* Skip Button overlay */}
            <div className="absolute bottom-6 right-6 z-10">
              {canSkipVideo ? (
                <button 
                  onClick={handleSkipVideo}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-full font-bold shadow-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95 border border-yellow-300 z-50 pointer-events-auto"
                >
                  Skip Ad
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              ) : (
                <div className="bg-black/80 backdrop-blur-sm text-gray-300 px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-3 border border-gray-600/50 pointer-events-none">
                  <span className="text-yellow-500 text-sm tracking-widest uppercasemr-2">Advertisement</span>
                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Skip Ad in {videoCountdown}s
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* In-App PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-zinc-900 w-full max-w-5xl h-[85vh] sm:h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-yellow-500/20 overflow-hidden relative transform transition-all">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-950">
              <h3 className="text-xl font-bold text-yellow-500 line-clamp-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Document Viewer
              </h3>
              <div className="flex gap-3">
                <a href={selectedPdf} download target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-yellow-500 transition-colors p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center" title="Force Download">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </a>
                <button onClick={() => setSelectedPdf(null)} className="text-zinc-400 hover:text-red-500 transition-colors p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center" title="Close Viewer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            {/* Modal Body: iFrame */}
            <div className="flex-1 w-full bg-zinc-800 relative">
              <iframe 
                src={buildViewerSrc(selectedPdf)}
                className="w-full h-full border-none absolute inset-0 bg-white"
                title="PDF Viewer"
              />
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
                Upload Resource
              </h3>
              <button disabled={isSubmitting} onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors shadow-sm border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Resource Title</label>
                <input 
                  type="text" 
                  value={addForm.title}
                  onChange={e => setAddForm({...addForm, title: e.target.value})}
                  placeholder="e.g. Advanced Calculus Chapter 1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                  value={addForm.description}
                  onChange={e => setAddForm({...addForm, description: e.target.value})}
                  placeholder="Briefly describe the contents of this resource..."
                  rows="3"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all font-medium resize-none"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">YouTube Video Link (Optional)</label>
                <input 
                  type="url" 
                  value={addForm.youtube_url}
                  onChange={e => setAddForm({...addForm, youtube_url: e.target.value})}
                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload PDF Document</label>
                <div className="border-2 border-dashed border-gray-200 hover:border-yellow-500 bg-gray-50 hover:bg-yellow-50/30 rounded-xl p-6 text-center transition-colors relative">
                  <input 
                    type="file" 
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={e => setAddForm({...addForm, file: e.target.files[0]})}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    {!addForm.file ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="text-sm font-bold text-gray-600">Drag & drop your PDF here</p>
                        <p className="text-xs font-medium text-gray-400 mt-1">or click to browse files</p>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-sm font-bold text-green-600 line-clamp-1 px-4">{addForm.file.name}</p>
                        <p className="text-xs font-medium text-gray-500 mt-1 pb-1">{(addForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-zinc-900 hover:bg-black text-yellow-500 font-bold py-3.5 rounded-xl shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  {isSubmitting ? (
                    <><svg className="animate-spin h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Uploading Resource...</>
                  ) : "Upload Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
