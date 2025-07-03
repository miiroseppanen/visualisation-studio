import { ChevronRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { Pole } from '@/lib/types'

interface PoleControlsProps {
  poles: Pole[]
  onPoleUpdate: (id: string, updates: Partial<Pole>) => void
  onPoleRemove: (id: string) => void
  isExpanded: boolean
  onToggle: () => void
}

export function PoleControls({ 
  poles, 
  onPoleUpdate, 
  onPoleRemove, 
  isExpanded, 
  onToggle 
}: PoleControlsProps) {
  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="w-full justify-between p-0 h-auto font-normal"
      >
        <span className="text-sm font-medium">Poles ({poles.length})</span>
        <ChevronRight 
          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
        />
      </Button>

      {isExpanded && (
        <div className="space-y-4 pl-4">
          <div className="text-xs text-gray-600 mb-2">
            Double-click on canvas to add poles
          </div>
          
          {poles.map((pole) => (
            <div key={pole.id} className="space-y-3 p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${pole.isPositive ? 'bg-red-500' : 'bg-blue-500'}`}
                  />
                  <span className="text-sm font-medium">
                    {pole.name || `Pole ${pole.id}`}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPoleRemove(pole.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Strength: {pole.strength.toFixed(1)}</Label>
                <Slider
                  value={[pole.strength]}
                  onValueChange={([value]) => onPoleUpdate(pole.id, { strength: value })}
                  min={0.5}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs">Polarity:</Label>
                <div className="flex gap-1">
                  <Button
                    variant={pole.isPositive ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPoleUpdate(pole.id, { isPositive: true })}
                    className="h-6 px-2 text-xs"
                  >
                    + North
                  </Button>
                  <Button
                    variant={!pole.isPositive ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPoleUpdate(pole.id, { isPositive: false })}
                    className="h-6 px-2 text-xs"
                  >
                    − South
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Position: ({Math.round(pole.x)}, {Math.round(pole.y)})
              </div>
            </div>
          ))}

          {poles.length === 0 && (
            <div className="text-xs text-gray-500 text-center py-4">
              No poles yet. Double-click on the canvas to add one.
            </div>
          )}
        </div>
      )}
    </div>
  )
} 