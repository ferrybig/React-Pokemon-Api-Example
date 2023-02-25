import { useQuerySuspenseSimple } from "./QueryClient";
import classes from "./PokemonList.module.css";

export default function PokemonList({ offset = 0, limit = 20, setPage }) {
	const { data } = useQuerySuspenseSimple(
		`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`
	);
	return (
		<div>
			<h1>Pokemon list</h1>
			<div className={classes.list}>
				{data.results.map((r) => (
					<PokemonCard name={r.name} setPage={setPage} />
				))}
			</div>
			<div>
				{offset > 0 && (
					<button
						onClick={() =>
							setPage({
								type: "list-pokemon",
								offset: Math.max(0, offset - limit),
								limit
							})
						}
					>
						Previeus page
					</button>
				)}
				{offset <= data.count - limit && (
					<button
						onClick={() =>
							setPage({
								type: "list-pokemon",
								offset: offset + limit,
								limit
							})
						}
					>
						Next page
					</button>
				)}
			</div>
		</div>
	);
}
