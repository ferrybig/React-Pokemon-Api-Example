import { useCallback, useTransition, useState } from "react";
import PokemonList from "./PokemonList";
import PokemonDetail from "./PokemonDetail";
import PageLoader from "./PageLoader";

export default function App() {
	const [isPending, startTransition] = useTransition();
	const [{ page, ...props }, setPageInternally] = useState({
		page: "list-pokemon"
	});
	const setPage = useCallback(
		(idOrNull) => {
			startTransition(() => {
				setPageInternally(idOrNull);
			});
		},
		[setPageInternally, startTransition]
	);

	const body =
		page === "list-pokemon" ? (
			<PokemonList {...props} setPage={setPage} />
		) : page === "detail-pokemon" ? (
			<PokemonDetail {...props} setPage={setPage} />
		) : (
			<div>{page}</div>
		);
	return (
		<div>
			{isPending && <PageLoader />}
			{body}
		</div>
	);
}
