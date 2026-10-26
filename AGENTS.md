<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Administration presentation lives in reusable `src/components/admin` modules, with individual leaf routes for each surface; this keeps navigation discoverable without duplicating views.
- Frontend-only administration uses an explicitly labeled local preview workspace, never a substitute for authentication or production role enforcement; this separates interface review from deferred backend integration.
