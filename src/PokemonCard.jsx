import { useQuerySuspenseSimple } from "./QueryClient";
import classes from "./PokemonCard.module.css";

export default function PokemonCard({ name, setPage }) {
	const { data } = useQuerySuspenseSimple(
		`https://pokeapi.co/api/v2/pokemon/${name}/`
	);
	return (
		<fieldset className={classes.detail}>
			<legend>
				<a onClick={() => setPage({ type: "detail-pokemon", name })}>
					{name}
				</a>
			</legend>
			<img src={data.sprites.front_default} className={classes.image} />
			<div></div>
		</fieldset>
	);
}
