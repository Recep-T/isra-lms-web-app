import React, { useEffect, useState } from 'react';
import { ref, push, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import { FaStar, FaEdit, FaTrash } from 'react-icons/fa';

// 💡 Admin Kodu (Yorum Silme ve Cevap Silme için kullanılır)
const ADMIN_DELETE_CODE = '123';

export default function CommentSection({ currentUserId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  // 💡 YENİ STATE: Kullanıcının oy verip vermediğini tutar
  const [hasRated, setHasRated] = useState(false);
  // 💡 YENİ STATE: Kullanıcının yorum yapıp yapmadığını tutar
  const [hasCommented, setHasCommented] = useState(false);

  // Check if current user is admin based on Firebase 'users' node
  useEffect(() => {
    // currentUserId yoksa veya guest ise kontrol etme
    if (!currentUserId || currentUserId === 'guest') {
      setIsAdmin(false);
      setHasRated(true); // Giriş yapmayana oy verme yetkisini hemen kapat
      return;
    }

    // Firebase'deki users düğümünü kontrol et
    const userRef = ref(db, `users/${currentUserId}`);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.role === 'admin') setIsAdmin(true);
      else setIsAdmin(false);
    });

    // 💡 YENİ: Kullanıcının oy verip vermediğini kontrol et
    const userRatingRef = ref(db, `userRatings/${currentUserId}`);
    onValue(userRatingRef, (snapshot) => {
      // Eğer kullanıcıRatings altında ID'si varsa, oy vermiştir.
      const userRatingValue = snapshot.val();

      if (
        userRatingValue &&
        typeof userRatingValue === 'number' &&
        userRatingValue >= 1 &&
        userRatingValue <= 5
      ) {
        setHasRated(true);
        setRating(userRatingValue); // Kullanıcının daha önce verdiği oyu UI'a set et
      } else {
        setHasRated(false);
        setRating(0);
      }
    });

    // 💡 YENİ: Kullanıcının yorum yapıp yapmadığını kontrol et (yorumlar altında user ID'si ile)
    const commentsRef = ref(db, 'comments');
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const userComments = Object.values(data).filter(
        (comment) => comment.userId === currentUserId,
      );
      // Eğer kullanıcının hiç yorumu yoksa, hasCommented false olur.
      setHasCommented(userComments.length > 0);
    });
  }, [currentUserId]);

  // Fetch comments and ratings in real time
  useEffect(() => {
    const commentsRef = ref(db, 'comments');
    const allRatingsRef = ref(db, 'allRatings'); // Toplam puanları tutan yeni düğüm

    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const formatted = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));
      setComments(formatted);
    });

    // 💡 GÜNCELLEME: Tüm derecelendirmeleri 'allRatings' düğümünden çekiyoruz
    onValue(allRatingsRef, (snapshot) => {
      const data = snapshot.val() || {};
      // push ile eklendiği için key'ler rastgele string'ler olacaktır.
      const ratingsArray = Object.values(data).filter(
        (val) => typeof val === 'number',
      );
      if (ratingsArray.length > 0) {
        const avg =
          ratingsArray.reduce((sum, val) => sum + val, 0) / ratingsArray.length;
        setAverageRating(avg.toFixed(1));
        setTotalRatings(ratingsArray.length);
      } else {
        setAverageRating(0);
        setTotalRatings(0);
      }
    });
  }, []);

  // 💡 GÜNCELLEME: Yorum Ekleme Fonksiyonu
  const handleAddComment = () => {
    if (!currentUserId || currentUserId === 'guest') {
      alert('Please login to post a comment.');
      return;
    }

    if (!newComment.trim()) return;

    push(ref(db, 'comments'), {
      userId: currentUserId, // Yorumu yapan kullanıcı ID'si
      text: newComment,
      timestamp: Date.now(),
    }).then(() => {
      setNewComment('');
      setHasCommented(true); // Yorum ekledikten sonra durumu güncelle
    });
  };

  // 💡 GÜNCELLEME: Derecelendirme Fonksiyonu
  const handleRating = (value) => {
    if (!currentUserId || currentUserId === 'guest') {
      alert('Please login to give a rating.');
      return;
    }
    if (!hasCommented) {
      alert('You must post at least one comment before rating.');
      return;
    }
    if (hasRated) {
      alert('You have already given a rating. You can only rate once.');
      return;
    }

    // 1. Genel derecelendirmelere ekle
    push(ref(db, `allRatings`), value);

    // 2. Kullanıcının oy verdiğini kaydet (değerin kendisi önemli değil, varlığı önemli)
    set(ref(db, `userRatings/${currentUserId}`), value)
      .then(() => {
        setRating(value); // UI için rating'i güncelle
        setHasRated(true); // State'i güncelle
        alert(`Thanks for rating ${value} stars!`);
      })
      .catch((error) => {
        console.error('Error setting rating:', error);
        alert('Failed to save rating. Try again.');
      });
  };

  // 💡 YENİ FONKSİYON: Derecelendirmeleri Sıfırla (Admin)
  const handleResetRatings = () => {
    if (!isAdmin) {
      alert('You must be an admin to reset ratings.');
      return;
    }

    const confirmReset = window.confirm(
      `Are you sure you want to delete ALL ${totalRatings} ratings and reset the average to 0? This cannot be undone.`,
    );

    if (confirmReset) {
      const allRatingsRef = ref(db, 'allRatings');
      const userRatingsRef = ref(db, 'userRatings');

      // 1. Tüm genel derecelendirmeleri sil
      set(allRatingsRef, null)
        .then(() => {
          // 2. Tüm kullanıcıların oy verme durumlarını sil
          return set(userRatingsRef, null);
        })
        .then(() => {
          alert('Ratings have been successfully reset!');
          setHasRated(false); // Adminin de oy verme durumunu sıfırla
          setRating(0); // Kendi oyu da sıfırlanır
        })
        .catch((error) => {
          console.error('Error resetting ratings:', error);
          alert('Failed to reset ratings. Check console for details.');
        });
    }
  };

  // Admin Kodu Doğrulaması Eklendi (Yorum Silme)
  const handleDeleteComment = (commentId) => {
    const enteredCode = prompt('Enter admin code to delete this comment:');

    if (enteredCode === ADMIN_DELETE_CODE) {
      set(ref(db, `comments/${commentId}`), null);
      alert('Comment deleted successfully!');
    } else if (enteredCode !== null) {
      alert('Invalid admin code. Comment not deleted.');
    }
  };

  const handleUpdateComment = (commentId, newText) => {
    // Edit işlemi sadece isAdmin ise yapılabilir.
    if (!isAdmin) {
      alert('You must be an admin to edit comments.');
      return;
    }
    set(ref(db, `comments/${commentId}/text`), newText);
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Rating bölümünün altındaki uyarı mesajı
  const ratingStatusMessage =
    currentUserId === 'guest'
      ? 'Please login to leave a rating.'
      : !hasCommented
        ? 'You must post a comment before you can rate.'
        : hasRated
          ? `You rated ${rating} stars. Thank you!` // Oyu gösterir
          : 'Click a star to submit your one-time rating.';

  return (
    <section className='bg-white shadow-md rounded-xl p-6 max-w-2xl mx-auto mt-12'>
      <h2 className='text-2xl font-bold text-indigo-700 mb-4 text-center'>
        💬 Community Feedback
      </h2>

      {/* ⭐ Rating Section */}
      <div className='text-center mb-6'>
        <div className='flex justify-center mb-2'>
          {[1, 2, 3, 4, 5].map((value) => (
            <FaStar
              key={value}
              size={28}
              onClick={() => handleRating(value)}
              // Yıldızın görünüm mantığı:
              className={`transition ${
                // Eğer kullanıcı oy vermişse VEYA oy verme yetkisi yoksa, tıklamayı engelle
                !hasCommented || hasRated || currentUserId === 'guest'
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'cursor-pointer hover:text-yellow-400 text-gray-300' // Tıklanabilir, hover ile sarı olur, yoksa soluk gri
              } ${
                // Kullanıcının verdiği oyu parlak göster (hasRated durumu useEffect'te yönetiliyor)
                value <= rating && rating > 0 ? 'text-yellow-500' : ''
              }`}
            />
          ))}
        </div>

        <p className='text-gray-600 text-sm'>
          Average Rating:{' '}
          {/* ✨ DÜZELTME BAŞLANGICI: Rengi daima sarı (altın) yaptık */}
          <span className={`font-semibold text-yellow-500`}>
            {averageRating} / 5
          </span>{' '}
          {/* ✨ DÜZELTME BİTİŞİ */}({totalRatings} ratings)
        </p>

        <p className='text-xs font-medium mt-2 text-indigo-500'>
          {ratingStatusMessage}
        </p>
      </div>

      {/* 💡 Rating Sıfırlama Düğmesi (Sadece Admin) */}
      {isAdmin && (
        <div className='text-center mb-6'>
          <button
            onClick={handleResetRatings}
            className='bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition'
          >
            Reset All Ratings (Admin Only)
          </button>
        </div>
      )}

      {/* 📝 Comment Input */}
      <div className='flex gap-2 mb-6'>
        <input
          className='flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400'
          placeholder={
            currentUserId === 'guest'
              ? 'Please login to post a comment...'
              : 'Write a comment...'
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={currentUserId === 'guest'} // Giriş yapılmadıysa yorum yapma engellenir
        />
        <button
          onClick={handleAddComment}
          className={`text-white px-4 py-2 rounded-lg transition ${
            currentUserId === 'guest'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
          disabled={currentUserId === 'guest'}
        >
          Post
        </button>
      </div>

      {/* 💬 Comments List */}
      <div className='space-y-4'>
        {comments.length === 0 ? (
          <p className='text-center text-gray-500'>
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
                handleDeleteComment={handleDeleteComment}
                handleUpdateComment={handleUpdateComment}
                formatDate={formatDate}
              />
            ))
        )}
      </div>
    </section>
  );
}

// --- Individual Comment Component ---
function Comment({
  comment,
  isAdmin,
  currentUserId,
  handleDeleteComment,
  handleUpdateComment,
  formatDate,
}) {
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const repliesRef = ref(db, `comments/${comment.id}/replies`);
    onValue(repliesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const formatted = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));
      setReplies(formatted);
    });
  }, [comment.id]);

  const handleAddReply = () => {
    if (!currentUserId || currentUserId === 'guest') {
      alert('Please login to post a reply.');
      return;
    }
    if (!replyText.trim()) return;

    push(ref(db, `comments/${comment.id}/replies`), {
      userId: currentUserId, // Cevabı yapan kullanıcı ID'si
      text: replyText,
      timestamp: Date.now(),
    });
    setReplyText('');
  };

  // 💡 Yeni: Cevap silme işlemi için de admin kodu doğrulaması eklendi
  const handleDeleteReply = (replyId) => {
    const enteredCode = prompt('Enter admin code to delete this reply:');

    if (enteredCode === ADMIN_DELETE_CODE) {
      set(ref(db, `comments/${comment.id}/replies/${replyId}`), null);
      alert('Reply deleted successfully!');
    } else if (enteredCode !== null) {
      alert('Invalid admin code. Reply not deleted.');
    }
  };

  const handleUpdateReply = (replyId, newText) => {
    // Sadece admin yetkisi gerektirir
    if (!isAdmin) {
      alert('You must be an admin to edit replies.');
      return;
    }
    set(ref(db, `comments/${comment.id}/replies/${replyId}/text`), newText);
  };

  return (
    <div className='border border-gray-200 rounded-lg p-3 bg-gray-50'>
      <div className='flex justify-between items-center mb-1'>
        {isEditing ? (
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className='border p-1 rounded-lg flex-1 mr-2'
          />
        ) : (
          <p className='text-gray-800 font-semibold'>{comment.text}</p>
        )}
        <span className='text-gray-400 text-xs'>
          {formatDate(comment.timestamp)}
        </span>
      </div>

      {/* 🛠️ Edit/Delete Buttons: Edit sadece Admin içindir, Delete herkes içindir. */}
      <div className='flex gap-2 mt-2'>
        {/* Edit Butonu SADECE Adminler için kalır */}
        {isAdmin && (
          <>
            {isEditing ? (
              <button
                onClick={() => {
                  handleUpdateComment(comment.id, editText);
                  setIsEditing(false);
                }}
                className='text-sm text-green-600 hover:underline flex items-center gap-1'
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className='text-sm text-yellow-600 hover:text-yellow-700 transition flex items-center gap-1'
              >
                <FaEdit size={14} />
                Edit
              </button>
            )}
          </>
        )}

        {/* Delete Butonu HERKES İÇİN görünür olur, Admin Kodu ister */}
        <button
          onClick={() => handleDeleteComment(comment.id)}
          className='text-sm text-red-600 hover:text-red-700 transition flex items-center gap-1'
        >
          <FaTrash size={14} />
        </button>
      </div>

      {/* Reply Button */}
      <button
        className='text-sm text-indigo-600 mt-2 hover:underline'
        onClick={() => setShowReplies((prev) => !prev)}
      >
        {showReplies
          ? `Hide Replies (${replies.length})`
          : `Reply (${replies.length})`}
      </button>

      {/* Reply Input and List */}
      {showReplies && (
        <div className='mt-3 ml-4'>
          <div className='flex gap-2 mb-3'>
            <input
              className='flex-1 border p-1 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300'
              placeholder={
                currentUserId === 'guest'
                  ? 'Please login to reply...'
                  : 'Write a reply...'
              }
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={currentUserId === 'guest'} // Giriş yapılmadıysa cevap engellenir
            />
            <button
              onClick={handleAddReply}
              className={`text-white px-3 py-1 rounded-lg text-sm transition ${
                currentUserId === 'guest'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              disabled={currentUserId === 'guest'}
            >
              Send
            </button>
          </div>

          {replies.length > 0 && (
            <div className='space-y-2'>
              {replies
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((reply) => (
                  <div
                    key={reply.id}
                    className='pl-3 border-l-2 border-indigo-200 text-sm text-gray-700 flex justify-between items-center'
                  >
                    <span>{reply.text}</span>
                    <span className='text-gray-400 text-xs'>
                      {formatDate(reply.timestamp)}
                    </span>
                    {/* Cevap Düzenleme/Silme Sadece Admin İçindir */}
                    {isAdmin && (
                      <div className='flex gap-1 ml-2'>
                        {/* Düzenleme sadece isAdmin */}
                        <button
                          onClick={() => {
                            const newText = prompt('Edit reply:', reply.text);
                            if (newText) handleUpdateReply(reply.id, newText);
                          }}
                          className='text-yellow-600 text-xs hover:underline flex items-center gap-1'
                        >
                          <FaEdit size={12} />
                        </button>
                        {/* Silme admin kodu gerektirir */}
                        <button
                          onClick={() => handleDeleteReply(reply.id)}
                          className='text-red-600 text-xs hover:underline flex items-center gap-1'
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
