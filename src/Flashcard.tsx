type Props = {
    word : string;
    image : string;
};

export default function Flashcard({word, image}:Props){
    return(
    <div style={{ border: "2px solid #4f46e5", padding: 20, borderRadius: 12 }}>
      <img src={image} width={150} alt={word} />
      <h2>{word}</h2>
    </div>

    );
}