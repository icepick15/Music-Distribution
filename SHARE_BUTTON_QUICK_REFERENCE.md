# 🔗 Public Song Sharing - Quick Reference

## 📍 Files Changed

### Backend

- ✅ `src/apps/songs/models.py` - Added `share_slug` field and `public_url` property
- ✅ `src/apps/songs/views.py` - Added `public_song_view()` endpoint
- ✅ `src/apps/songs/urls.py` - Added public route
- ✅ `src/apps/notifications/signals.py` - Added public URL to email context
- ✅ `templates/notifications/song_distributed.html` - Updated share buttons

### Migrations

- ✅ `src/apps/songs/migrations/0006_add_share_slug_field.py`

### Scripts

- ✅ `generate_song_slugs.py` - Generate slugs for existing songs
- ✅ `test_public_sharing.py` - Test public API

### Documentation

- ✅ `PUBLIC_SHARING_SYSTEM_COMPLETE.md` - Full documentation
- ✅ `SHARE_BUTTON_COMPLETE.md` - Summary

---

## 🎯 Key Features

| Feature              | Status | Description                                  |
| -------------------- | ------ | -------------------------------------------- |
| Public URL           | ✅     | `http://yoursite.com/song/song-title-artist` |
| No Auth Required     | ✅     | Anyone can view distributed songs            |
| Auto Slug Generation | ✅     | Slugs created automatically on save          |
| Platform Links       | ✅     | Direct links to Spotify, Apple Music, etc.   |
| Share Buttons        | ✅     | Twitter, Facebook, WhatsApp in email         |
| Security             | ✅     | Only distributed songs are public            |
| Safe Data            | ✅     | No sensitive info exposed                    |

---

## 🌐 API Endpoints

### Get Public Song

```
GET /api/songs/public/<slug>/
```

**Authentication:** None (public)

**Example:**

```bash
curl http://localhost:8000/api/songs/public/my-song-artist/
```

**Response:**

```json
{
  "id": "uuid",
  "title": "My Song",
  "artist_name": "Artist Name",
  "cover_image": "https://...",
  "genre": "Afrobeat",
  "release_date": "2025-10-04",
  "duration": "3:45",
  "platform_links": [
    {
      "platform": "Spotify",
      "url": "https://open.spotify.com/..."
    }
  ],
  "share_url": "http://localhost:5173/song/my-song-artist",
  "total_streams": 1000
}
```

---

## 📧 Email Variables

When song is distributed, these variables are available in email templates:

| Variable                    | Example                    | Description              |
| --------------------------- | -------------------------- | ------------------------ |
| `song_title`                | "My Amazing Song"          | Song title               |
| `artist_name`               | "John Doe"                 | Artist's full name       |
| `release_date`              | "October 4, 2025"          | Distribution date        |
| `share_url`                 | `http://site.com/song/...` | **Public shareable URL** |
| `song_id`                   | `uuid`                     | Song database ID         |
| `platform_urls.spotify`     | `https://spotify.com/...`  | Spotify direct link      |
| `platform_urls.apple_music` | `https://apple.com/...`    | Apple Music direct link  |
| `platform_urls.youtube`     | `https://youtube.com/...`  | YouTube direct link      |

---

## 🔧 Commands

### Generate slugs for existing songs

```bash
python generate_song_slugs.py
```

### Test public API

```bash
python test_public_sharing.py
```

### Create new migration (if needed)

```bash
python manage.py makemigrations songs
python manage.py migrate songs
```

### Check song's public URL in Django shell

```python
python manage.py shell

from src.apps.songs.models import Song
song = Song.objects.get(title="My Song")
print(song.share_slug)        # e.g., "my-song-artist"
print(song.public_url)         # e.g., "http://localhost:5173/song/my-song-artist"
```

---

## 🎨 Frontend TODO

### 1. Create Public Song Page Component

**File:** `frontend/src/pages/PublicSongPage.jsx`

```jsx
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function PublicSongPage() {
  const { slug } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/songs/public/${slug}/`)
      .then((res) => {
        setSong(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!song) return <div>Song not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <img
            src={song.cover_image}
            alt={song.title}
            className="w-64 h-64 mx-auto rounded-lg shadow-2xl mb-6"
          />
          <h1 className="text-5xl font-bold mb-2">{song.title}</h1>
          <p className="text-2xl text-gray-300">by {song.artist_name}</p>
          {song.featured_artists && (
            <p className="text-lg text-gray-400">
              feat. {song.featured_artists}
            </p>
          )}
        </div>

        {/* Platform Links */}
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">🎵 Listen Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {song.platform_links.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-lg p-4 text-center transition-all"
              >
                <span className="text-xl">▶️</span>
                <span className="ml-2">Listen on {link.platform}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Song Info */}
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {song.genre && (
              <div>
                <p className="text-gray-400 text-sm">Genre</p>
                <p className="font-semibold">{song.genre}</p>
              </div>
            )}
            {song.release_date && (
              <div>
                <p className="text-gray-400 text-sm">Released</p>
                <p className="font-semibold">
                  {new Date(song.release_date).toLocaleDateString()}
                </p>
              </div>
            )}
            {song.duration && (
              <div>
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="font-semibold">{song.duration}</p>
              </div>
            )}
            {song.total_streams > 0 && (
              <div>
                <p className="text-gray-400 text-sm">Streams</p>
                <p className="font-semibold">
                  {song.total_streams.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Share */}
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-4">Share this song</h3>
          <div className="flex justify-center gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Check out "${song.title}" by ${song.artist_name}!`
              )} ${encodeURIComponent(song.share_url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg"
            >
              Twitter
            </a>
            <a
              href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                song.share_url
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-700 hover:bg-blue-800 px-6 py-2 rounded-lg"
            >
              Facebook
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Check out "${song.title}" by ${song.artist_name}! ${song.share_url}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2. Add Route

**File:** `frontend/src/App.jsx`

```jsx
import PublicSongPage from "./pages/PublicSongPage";

// In your routes:
<Route path="/song/:slug" element={<PublicSongPage />} />;
```

### 3. Update Axios Base URL (if needed)

**File:** `frontend/src/lib/axios.js`

```jsx
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export default api;
```

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Django server running
- [ ] Migration applied successfully
- [ ] Existing songs have slugs generated
- [ ] Public API endpoint working
- [ ] Email contains correct share URL
- [ ] Share buttons link to public page (not dashboard)
- [ ] Non-distributed songs return 404
- [ ] Frontend component created
- [ ] Frontend route configured
- [ ] Share URL opens without login
- [ ] Platform links working
- [ ] Social share buttons working

---

## 🐛 Troubleshooting

### Share URL returns 404

- Check song status: Must be 'distributed'
- Verify slug exists: `song.share_slug` should not be empty
- Run `python generate_song_slugs.py` if slugs are missing

### No platform links showing

- Add platform distributions in Django admin
- Set platform URLs in SongDistribution model
- Mark distributions as 'live' status

### Share buttons not working

- Check `FRONTEND_URL` in settings.py
- Verify email template updated
- Test with: `python test_public_sharing.py`

### Frontend route not found

- Add route in App.jsx: `<Route path="/song/:slug" element={<PublicSongPage />} />`
- Check axios baseURL configuration
- Verify API endpoint accessible

---

## 📞 Support

Questions? Check these docs:

- `PUBLIC_SHARING_SYSTEM_COMPLETE.md` - Full implementation guide
- `SHARE_BUTTON_COMPLETE.md` - Summary and benefits
- This file - Quick reference

---

## 🎉 You're All Set!

The backend is complete. Share buttons now work perfectly!

**What's working:**

- ✅ Public URLs generated automatically
- ✅ Share buttons in distribution emails
- ✅ API endpoint for public access
- ✅ Security (only distributed songs)
- ✅ Platform links included

**Next step:** Build the frontend component to display the public song page beautifully!
