"use client";

import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import Pitch from "@/components/Pitch";
import ListSection from "@/components/ListSection";
import StartersMirrorList from "@/components/StartersMirrorList";
import ProspectsSection from "@/components/ProspectsSection";
import KasaPanel from "@/components/KasaPanel";
import ActionMenu, { MenuAction } from "@/components/ActionMenu";
import Modal from "@/components/Modal";
import { useGalaStore } from "@/lib/store";
import { ALL_PLAYERS } from "@/lib/players-data";

type MenuState = { playerId: string; x: number; y: number; kind: "pitch" | "list" } | null;
type DialogState =
  | { kind: "benchConfirm"; playerId: string }
  | { kind: "amount"; playerId: string; type: "sat" | "kirala" }
  | null;

export default function Home() {
  const {
    formation,
    starters,
    bench,
    reserve,
    prospects,
    transactions,
    setFormation,
    movePlayer,
    addProspectToSquad,
    sellPlayer,
    loanPlayer,
    firePlayer,
    undoTransaction,
  } = useGalaStore();

  const [menu, setMenu] = useState<MenuState>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [amountInput, setAmountInput] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function openPitchMenu(playerId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setMenu({ playerId, x: e.clientX, y: e.clientY, kind: "pitch" });
  }

  function openListMenu(playerId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setMenu({ playerId, x: e.clientX, y: e.clientY, kind: "list" });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const playerId = String(active.id);
    const overId = String(over.id);

    if (overId.startsWith("slot-")) {
      movePlayer(playerId, { type: "slot", slotId: overId.replace("slot-", "") });
    } else if (overId === "bench") {
      movePlayer(playerId, { type: "bench" });
    } else if (overId === "reserve") {
      movePlayer(playerId, { type: "reserve" });
    }
  }

  const pitchActions: MenuAction[] = menu
    ? [
        {
          label: "Yedeğe Al",
          onClick: () => setDialog({ kind: "benchConfirm", playerId: menu.playerId }),
        },
      ]
    : [];

  const listActions: MenuAction[] = menu
    ? [
        { label: "Sat", onClick: () => setDialog({ kind: "amount", playerId: menu.playerId, type: "sat" }) },
        { label: "Kirala", onClick: () => setDialog({ kind: "amount", playerId: menu.playerId, type: "kirala" }) },
        { label: "Kov", danger: true, onClick: () => firePlayer(menu.playerId) },
      ]
    : [];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-neutral-950 flex items-center justify-center">
        <div className="w-9 h-9 rounded-full bg-yellow-400 animate-pulse" />
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-neutral-950 text-white">
        <header className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-red-900 font-black">
            GS
          </div>
          <h1 className="text-xl font-black tracking-tight">gala11</h1>
          <span className="text-white/40 text-sm">Galatasaray İlk 11 Oluşturucu</span>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <Pitch
            formation={formation}
            starters={starters}
            onFormationChange={setFormation}
            onPlayerClick={openPitchMenu}
          />

          <div className="flex flex-col gap-4">
            <StartersMirrorList formation={formation} starters={starters} onPlayerClick={openListMenu} />
            <ListSection id="bench" title="Yedekler" playerIds={bench} limit={7} onPlayerClick={openListMenu} />
            <ListSection id="reserve" title="Rezerv" playerIds={reserve} onPlayerClick={openListMenu} />
            <ProspectsSection playerIds={prospects} onAdd={addProspectToSquad} />
            <KasaPanel transactions={transactions} onUndo={undoTransaction} />
          </div>
        </main>

        {menu && (
          <ActionMenu
            x={menu.x}
            y={menu.y}
            actions={menu.kind === "pitch" ? pitchActions : listActions}
            onClose={() => setMenu(null)}
          />
        )}

        {dialog?.kind === "benchConfirm" && (
          <Modal title="Yedeğe Al" onClose={() => setDialog(null)}>
            <p className="text-white/70 text-sm mb-5">
              {ALL_PLAYERS[dialog.playerId]?.name} yedek kulübesine alınsın mı?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDialog(null)}
                className="px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  movePlayer(dialog.playerId, { type: "bench" });
                  setDialog(null);
                }}
                className="px-4 py-2 rounded-lg text-sm bg-yellow-400 text-red-900 font-semibold hover:bg-yellow-300"
              >
                Evet
              </button>
            </div>
          </Modal>
        )}

        {dialog?.kind === "amount" && (
          <Modal
            title={dialog.type === "sat" ? "Oyuncuyu Sat" : "Oyuncuyu Kirala"}
            onClose={() => setDialog(null)}
          >
            <p className="text-white/70 text-sm mb-3">
              {ALL_PLAYERS[dialog.playerId]?.name} için{" "}
              {dialog.type === "sat" ? "bonservis bedeli" : "kiralık bedeli"} girin (€)
            </p>
            <input
              autoFocus
              type="number"
              min={0}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0"
              className="w-full mb-5 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:border-yellow-400"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setDialog(null);
                  setAmountInput("");
                }}
                className="px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  const amount = Number(amountInput) || 0;
                  if (dialog.type === "sat") sellPlayer(dialog.playerId, amount);
                  else loanPlayer(dialog.playerId, amount);
                  setDialog(null);
                  setAmountInput("");
                }}
                className="px-4 py-2 rounded-lg text-sm bg-yellow-400 text-red-900 font-semibold hover:bg-yellow-300"
              >
                Onayla
              </button>
            </div>
          </Modal>
        )}
      </div>
    </DndContext>
  );
}
