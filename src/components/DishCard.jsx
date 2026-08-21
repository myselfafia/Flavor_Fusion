import './DishCard.css'

function DishCard({ dish }) { return <article className="dish-card"><div className="dish-image"><img src={dish.image} alt={dish.name}/><span className={dish.match === 100 ? 'match perfect' : 'match'}>{dish.match === 100 && '✦ '}{dish.match}% Match</span></div><div className="dish-content"><span className="cuisine">{dish.cuisine}</span><h3>{dish.name}</h3><p className="meta">◷ {dish.time}<i />◒ {dish.level}</p><div className="missing-area">{dish.missing.length ? <><small>Missing:</small><div>{dish.missing.map((item) => <span key={item}>{item}</span>)}</div></> : <strong>✓ You have all ingredients!</strong>}</div></div></article> }

export default DishCard
