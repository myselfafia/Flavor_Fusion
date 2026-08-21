import { useState } from 'react'
import './DishCard.css'

function DishCard({ dish }) { const [preview, setPreview] = useState(false); return <article className="dish-card"><div className="dish-image"><img src={dish.image} alt={dish.name}/><button className="image-preview-button" onClick={() => setPreview(!preview)} aria-expanded={preview}>{preview ? 'Close preview' : 'Quick preview'}</button><span className={dish.match === 100 ? 'match perfect' : 'match'}>{dish.match === 100 && '✦ '}{dish.match}% Match</span></div>{preview && <div className="recipe-preview"><strong>{dish.name}</strong><p>Ready in {dish.time}. {dish.missing.length ? `Add ${dish.missing.join(', ')} to make this a complete match.` : 'Everything is already in your pantry—time to cook!'}</p></div>}<div className="dish-content"><span className="cuisine">{dish.cuisine}</span><h3>{dish.name}</h3><p className="meta">◷ {dish.time}<i />◒ {dish.level}</p><div className="missing-area">{dish.missing.length ? <><small>Missing:</small><div>{dish.missing.map((item) => <span key={item}>{item}</span>)}</div></> : <strong>✓ You have all ingredients!</strong>}</div></div></article> }

export default DishCard
