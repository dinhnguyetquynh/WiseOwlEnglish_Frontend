import { useState } from 'react'

import './App.css'
import Flashcard from './Flashcard'
import LearningPage from './pages/admin/LearningPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LearnerLayout from './layouts/LearnerLayout';
import HomePage from './pages/learner/HomePage';
import PracticePage from './pages/learner/PracticePage';
import RankPage from './pages/learner/RankPage';
import ProfilePage from './pages/learner/ProfilePage';
import LessonMenu from './pages/learner/ui/LessonMenu';
import WelcomePage from './pages/auth/ui/WelcomePage';
import RegisterPage from './pages/learner/ui/RegisterPage';
import VerifyOtpPage from './pages/learner/ui/VerifyOtpPage';
import LoginPage from './pages/auth/ui/LoginPage';
import CreateLearnerProfilePage from './pages/learner/ui/CreateLearnerProfilePage';
import VocabLearnPage from './pages/learner/ui/VocabLearnPage';
import SelectProfilePage from './pages/learner/ui/SelectProfilePage';
import SentenceLearnPage from './pages/learner/ui/SentenceLearnPage';
import PictureGuessingGame from './pages/learner/ui/PictureGuessingGame';
import GameSelectPage from './pages/learner/ui/GameSelectedPage';
import PictureGuessingGamePage from './pages/learner/ui/PictureGuessingGame';
import GameResultPage from './pages/learner/ui/GameResultPage';
import SoundWordGamePage from './pages/learner/ui/SoundWordGamePage';
import PictureSentenceGamePage from './pages/learner/ui/PictureSentenceGamePage';

function App() {

  return (
      <BrowserRouter>
      <Routes>
         {/* Welcome sẽ là trang đầu tiên */}
        <Route path="/" element={<WelcomePage />} />

          {/* Đăng ký / Đăng nhập */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/select-profile" element={<SelectProfilePage/>}/>
         <Route path="/create-profile" element={<CreateLearnerProfilePage/>} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        {/* Tất cả route của learner đều nằm trong LearnerLayout */}
        <Route path="/learn" element={<LearnerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="units/:unitId" element={<LessonMenu />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="rank" element={<RankPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
         <Route path="/learn/units/:unitId/vocab/learn"  element={<VocabLearnPage />} /> 
         <Route path="/learn/units/:unitId/sentence/learn" element={<SentenceLearnPage/>}/>
         <Route path ="/learn/units/:unitId/vocab/review" element={<GameSelectPage/>}/>
         <Route path ="/learn/units/:unitId/sentence/review" element={<PictureSentenceGamePage/>}/>
         <Route path="/games/picture-guessing/:unitId" element={<PictureGuessingGamePage />} />
         <Route path="/games/sound-word/:unitId" element={<SoundWordGamePage />} />
         <Route path="/game-result" element={<GameResultPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
