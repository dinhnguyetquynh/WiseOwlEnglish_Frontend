import './App.css'
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
import GameSelectPage from './pages/learner/ui/GameSelectedPage';
import PictureGuessingGamePage from './pages/learner/ui/PictureGuessingGame';
import GameResultPage from './pages/learner/ui/GameResultPage';
import SoundWordGamePage from './pages/learner/ui/SoundWordGamePage';
import PictureSentenceGamePage from './pages/learner/ui/PictureSentenceGamePage';
import { ProtectedRoute, PublicRoute } from './routes/RouteGuards';
import TestPage from './pages/learner/ui/TestPage';
import TestResultPage from './pages/learner/ui/TestResultPage';
import LessonTestsPage from './pages/learner/ui/LessonTestsPage';
import PictureWordWritingGamePage from './pages/learner/ui/PictureWordWritingGamePage';
import PictureMatchWordGamePage from './pages/learner/ui/PictureMatchWordGamePage';
import GameSelectedPageSentence from './pages/learner/ui/GameSelectedPageSentence';
import SentenceHiddenGamePage from './pages/learner/ui/SentenceHiddenGamePage';
import WordToSentenceGamePage from './pages/learner/ui/WordToSentenceGamePage';

function App() {

  return (
      <BrowserRouter>
      <Routes>
           {/* PUBLIC */}
        <Route element={<PublicRoute />}> 
            <Route path="/" element={<WelcomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/select-profile" element={<SelectProfilePage/>}/>
            <Route path="/create-profile" element={<CreateLearnerProfilePage/>} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
        </Route>
      
        {/* Tất cả route của learner đều nằm trong LearnerLayout */}
         {/* PROTECTED */}
        <Route element={<ProtectedRoute />}>
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
            <Route path ="/learn/units/:unitId/sentence/review" element={<GameSelectedPageSentence/>}/>
            
            {/*Game tu vung */}
            <Route path="/games/picture-guessing/:unitId" element={<PictureGuessingGamePage />} />
            <Route path="/games/sound-word/:unitId" element={<SoundWordGamePage />} />
            <Route path="/games/picture-word/:unitId" element={<PictureWordWritingGamePage/>}/>
            <Route path="/games/picture-match-word/:unitId" element={<PictureMatchWordGamePage/>}/>
            {/*Game cau */}
            <Route path="/games/picture-sentence/:unitId" element={<PictureSentenceGamePage/>}/>
            <Route path="/games/sentence-word-hidden/:unitId" element={<SentenceHiddenGamePage/>}/>
            <Route path="/games/word-to-sentence/:unitId" element={<WordToSentenceGamePage/>}/>

            <Route path="/game-result" element={<GameResultPage />} />
            <Route path="/learn/units/:lessonId/testlist" element={<LessonTestsPage/>}/>
            <Route path="/learn/units/:testId/test" element={<TestPage/>}/>
            <Route path="/learn/test-result" element={<TestResultPage/>}/>

        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
