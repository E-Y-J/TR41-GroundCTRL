/**
 * Scenario Creator - Admin Tool
 * Multi-step wizard for creating training scenarios
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { createScenario, createScenarioStep, getSatellites, getGroundStations, getScenario, listScenarioSteps, updateScenario, updateScenarioStep } from '@/lib/api/scenarioService'
import AppHeader from '@/components/app-header'
import { Footer } from '@/components/footer'
import { FloatingNovaChat } from '@/components/nova/FloatingNovaChat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Check, Loader2, Rocket, AlertCircle, Trash2, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const STEPS = ['Basic Info', 'Satellite & Ground Station', 'Steps & Objectives', 'Review & Publish']

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const TIERS = ['ROOKIE_PILOT', 'MISSION_SPECIALIST', 'MISSION_COMMANDER']
const TYPES = ['GUIDED', 'SANDBOX']
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED']

export default function ScenarioCreator() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const viewId = searchParams.get('view')
  const scenarioId = editId || viewId

  const [currentStep, setCurrentStep] = useState(0)
  const [maxStepReached, setMaxStepReached] = useState(0) // Track furthest step user has reached
  const [loading, setLoading] = useState(false)
  const [satellites, setSatellites] = useState([])
  const [groundStations, setGroundStations] = useState([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Form data
  const [scenarioData, setScenarioData] = useState({
    code: '',
    title: '',
    description: '',
    difficulty: 'BEGINNER',
    tier: 'ROOKIE_PILOT',
    type: 'GUIDED',
    estimatedDurationMinutes: 30,
    status: 'DRAFT',
    isActive: true,
    isCore: false,
    isPublic: false,
    satellite_id: '',
    ground_station_id: '',
    ground_station_ids: [], // Multiple ground stations
    tags: [],
    objectives: [],
    prerequisites: []
  })

  const [steps, setSteps] = useState([
    {
      stepOrder: 1,
      title: '',
      instructions: '',
      objective: '',
      completionCondition: '',
      isCheckpoint: false,
      expectedDurationSeconds: 300,
      hint_suggestion: ''
    }
  ])

  // Load existing scenario for editing or viewing
  useEffect(() => {
    if (scenarioId) {
      loadExistingScenario(scenarioId)
    }
  }, [scenarioId])

  const loadExistingScenario = async (id) => {
    try {
      setLoading(true)
      
      // Load scenario data
      const scenarioResponse = await getScenario(id)
      const scenario = scenarioResponse?.data || scenarioResponse
      
      setScenarioData({
        code: scenario.code || '',
        title: scenario.title || '',
        description: scenario.description || '',
        difficulty: scenario.difficulty || 'BEGINNER',
        tier: scenario.tier || 'ROOKIE_PILOT',
        type: scenario.type || 'GUIDED',
        estimatedDurationMinutes: scenario.estimatedDurationMinutes || 30,
        status: scenario.status || 'DRAFT',
        isActive: scenario.isActive ?? true,
        isCore: scenario.isCore ?? false,
        isPublic: scenario.isPublic ?? false,
        satellite_id: scenario.satellite_id || '',
        ground_station_id: scenario.ground_station_id || '',
        tags: scenario.tags || [],
        objectives: scenario.objectives || [],
        prerequisites: scenario.prerequisites || []
      })
      
      // Load scenario steps
      const stepsResponse = await listScenarioSteps(id)
      const loadedSteps = stepsResponse?.data || stepsResponse
      
      if (Array.isArray(loadedSteps) && loadedSteps.length > 0) {
        setSteps(loadedSteps.map(step => ({
          id: step.id,
          stepOrder: step.stepOrder,
          title: step.title || '',
          instructions: step.instructions || '',
          objective: step.objective || '',
          completionCondition: step.completionCondition || '',
          isCheckpoint: step.isCheckpoint ?? false,
          expectedDurationSeconds: step.expectedDurationSeconds || 300,
          hint_suggestion: step.hint_suggestion || ''
        })))
      }
      
      setIsEditMode(!!editId)
      setIsViewMode(!!viewId)
      
      toast({
        title: viewId ? 'Viewing Scenario' : 'Loaded for Editing',
        description: `${viewId ? 'Viewing' : 'Editing'} scenario "${scenario.title}"`,
      })
    } catch (error) {
      console.error('Failed to load scenario:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load scenario',
        variant: 'destructive'
      })
      navigate('/admin/scenarios')
    } finally {
      setLoading(false)
    }
  }

  // Load satellites when on satellite step
  const loadSatellites = async () => {
    try {
      console.log('Loading satellites...')
      const response = await getSatellites()
      console.log('Satellites loaded:', response)
      
      const satelliteList = response?.data || response
      setSatellites(Array.isArray(satelliteList) ? satelliteList : [])
    } catch (error) {
      console.error('Error loading satellites:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load satellites',
        variant: 'destructive'
      })
    }
  }

  // Load ground stations when on satellite step
  const loadGroundStations = async () => {
    try {
      console.log('Loading ground stations...')
      const response = await getGroundStations()
      console.log('Ground stations loaded:', response)
      
      const stationList = response?.data || response
      setGroundStations(Array.isArray(stationList) ? stationList : [])
    } catch (error) {
      console.error('Error loading ground stations:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load ground stations',
        variant: 'destructive'
      })
    }
  }

  const handleNext = () => {
    if (!validateStep()) return
    
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      
      // Update maxStepReached - track the furthest validated step
      if (nextStep > maxStepReached) {
        setMaxStepReached(nextStep)
      }
      
      setValidationErrors({}) // Clear errors when moving to next step
      
      // Load satellites and ground stations when entering step 1
      if (nextStep === 1) {
        if (satellites.length === 0) loadSatellites()
        if (groundStations.length === 0) loadGroundStations()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setValidationErrors({}) // Clear errors when going back
    }
  }

  const handleInputChange = (field, value) => {
    setScenarioData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate code from title
    if (field === 'title' && value && !isEditMode) {
      const generatedCode = value
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 100) // Limit to 100 chars
      
      setScenarioData(prev => ({ ...prev, code: generatedCode }))
    }
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleArrayInput = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean)
    setScenarioData(prev => ({ ...prev, [field]: items }))
  }

  const addStep = () => {
    setSteps(prev => [
      ...prev,
      {
        stepOrder: prev.length + 1,
        title: '',
        instructions: '',
        objective: '',
        completionCondition: '',
        isCheckpoint: false,
        expectedDurationSeconds: 300,
        hint_suggestion: ''
      }
    ])
  }

  const removeStep = (index) => {
    if (steps.length === 1) {
      toast({
        title: 'Cannot Remove',
        description: 'At least one step is required',
        variant: 'destructive'
      })
      return
    }
    
    setSteps(prev => {
      const newSteps = prev.filter((_, i) => i !== index)
      // Renumber steps
      return newSteps.map((step, i) => ({ ...step, stepOrder: i + 1 }))
    })
  }

  const updateStep = (index, field, value) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, [field]: value } : step
    ))
  }

  // AI Suggestion functions
  const generateTagSuggestions = () => {
    if (!scenarioData.title && !scenarioData.description) {
      toast({
        title: 'Add Title or Description First',
        description: 'Please provide a title or description to generate tag suggestions',
        variant: 'destructive'
      })
      return
    }

    const text = `${scenarioData.title} ${scenarioData.description}`.toLowerCase()
    console.log('Generating tags from text:', text)
    const suggestedTags = []

    // Common space/satellite-related tags based on content
    const tagMapping = {
      'orbit': ['orbital-mechanics', 'orbit-control'],
      'power': ['power-management', 'battery-systems'],
      'battery': ['power-management', 'battery-systems'],
      'attitude': ['attitude-control', 'orientation'],
      'communication': ['communications', 'telemetry'],
      'telemetry': ['communications', 'telemetry'],
      'thermal': ['thermal-management', 'temperature-control'],
      'temperature': ['thermal-management', 'temperature-control'],
      'maneuver': ['orbital-maneuvers', 'trajectory'],
      'trajectory': ['orbital-maneuvers', 'trajectory'],
      'sensor': ['sensor-systems', 'data-collection'],
      'solar': ['solar-panels', 'power-generation'],
      'antenna': ['antenna-systems', 'signal-processing'],
      'command': ['command-control', 'operations'],
      'fuel': ['propulsion', 'fuel-management'],
      'propulsion': ['propulsion', 'fuel-management'],
      'station': ['ground-station', 'communication-link'],
      'ground': ['ground-station', 'communication-link'],
      'beginner': ['beginner-friendly', 'introductory'],
      'intro': ['beginner-friendly', 'introductory'],
      'basic': ['beginner-friendly', 'fundamentals'],
      'advanced': ['advanced-concepts', 'expert-level'],
      'satellite': ['satellite-operations', 'spacecraft-systems'],
      'space': ['space-operations', 'mission-control'],
      'control': ['mission-control', 'operations'],
      'data': ['data-analysis', 'telemetry'],
      'mission': ['mission-planning', 'operations']
    }

    // Check for keywords and add relevant tags
    Object.entries(tagMapping).forEach(([keyword, tags]) => {
      if (text.includes(keyword)) {
        console.log(`Found keyword "${keyword}", adding tags:`, tags)
        suggestedTags.push(...tags)
      }
    })

    // Add tier-based tags
    if (scenarioData.tier) {
      const tierTag = scenarioData.tier.toLowerCase().replace(/_/g, '-')
      suggestedTags.push(tierTag)
    }

    // Add difficulty-based tags
    if (scenarioData.difficulty) {
      const diffTag = `${scenarioData.difficulty.toLowerCase()}-level`
      suggestedTags.push(diffTag)
    }

    // Remove duplicates and limit to 6 tags
    const uniqueTags = [...new Set(suggestedTags)].slice(0, 6)
    console.log('Generated unique tags:', uniqueTags)

    if (uniqueTags.length > 0) {
      setScenarioData(prev => ({ ...prev, tags: uniqueTags }))
      toast({
        title: '✨ Tags Generated!',
        description: `Added ${uniqueTags.length} tag${uniqueTags.length !== 1 ? 's' : ''}: ${uniqueTags.join(', ')}`,
      })
    } else {
      // Provide default tags based on difficulty if no keywords found
      const defaultTags = ['satellite-operations', 'training', `${scenarioData.difficulty.toLowerCase()}-level`]
      setScenarioData(prev => ({ ...prev, tags: defaultTags }))
      toast({
        title: '✨ Default Tags Added',
        description: `Added ${defaultTags.length} default tags: ${defaultTags.join(', ')}`,
      })
    }
  }

  const generateObjectiveSuggestions = () => {
    if (!scenarioData.title && !scenarioData.description) {
      toast({
        title: 'Add Title or Description First',
        description: 'Please provide a title or description to generate learning objectives',
        variant: 'destructive'
      })
      return
    }

    const text = `${scenarioData.title} ${scenarioData.description}`.toLowerCase()
    const suggestedObjectives = []

    // Generate objectives based on common space operations themes (short phrases for comma-separation)
    const objectiveTemplates = {
      'orbit': 'Orbital mechanics fundamentals',
      'power': 'Power system management',
      'battery': 'Battery life optimization',
      'attitude': 'Satellite attitude control',
      'communication': 'Communication link establishment',
      'telemetry': 'Telemetry data interpretation',
      'thermal': 'Thermal system monitoring',
      'temperature': 'Temperature regulation',
      'maneuver': 'Orbital maneuver execution',
      'trajectory': 'Trajectory planning',
      'sensor': 'Sensor operation and data analysis',
      'command': 'Command protocol mastery',
      'station': 'Ground station coordination',
      'emergency': 'Emergency response procedures',
      'hohmann': 'Hohmann transfer technique',
      'transfer': 'Orbital transfer maneuvers',
      'delta-v': 'Delta-v calculation',
      'fuel': 'Fuel management strategies'
    }

    // Check for keywords and add relevant objectives
    Object.entries(objectiveTemplates).forEach(([keyword, objective]) => {
      if (text.includes(keyword)) {
        suggestedObjectives.push(objective)
      }
    })

    // Add some default objectives if none were found
    if (suggestedObjectives.length === 0) {
      suggestedObjectives.push(
        'Complete mission objectives successfully',
        'Demonstrate understanding of satellite operations',
        'Follow proper command procedures'
      )
    }

    // Limit to 4 objectives and ensure they're stored as array
    const uniqueObjectives = [...new Set(suggestedObjectives)].slice(0, 4)

    // Store as array (will be displayed as comma-separated via join in the textarea)
    setScenarioData(prev => ({ ...prev, objectives: uniqueObjectives }))
    
    toast({
      title: '✨ Objectives Generated!',
      description: `Added ${uniqueObjectives.length} learning objective${uniqueObjectives.length !== 1 ? 's' : ''}: "${uniqueObjectives.join(', ')}"`,
    })
  }

  const validateStep = () => {
    const errors = {}
    
    switch (currentStep) {
      case 0: // Basic Info
        if (!scenarioData.code) {
          errors.code = 'Scenario code is required'
        } else if (!/^[A-Z0-9_]+$/.test(scenarioData.code)) {
          errors.code = 'Code must be uppercase alphanumeric with underscores only'
        } else if (scenarioData.code.length > 100) {
          errors.code = 'Code must be 100 characters or fewer'
        }
        
        if (!scenarioData.title) {
          errors.title = 'Title is required'
        } else if (scenarioData.title.length > 200) {
          errors.title = 'Title must be 200 characters or fewer'
        }
        
        if (!scenarioData.description) {
          errors.description = 'Description is required'
        } else if (scenarioData.description.length > 2000) {
          errors.description = 'Description must be 2000 characters or fewer'
        }
        
        if (scenarioData.estimatedDurationMinutes < 1 || scenarioData.estimatedDurationMinutes > 480) {
          errors.estimatedDurationMinutes = 'Duration must be between 1 and 480 minutes'
        }
        
        break
      
      case 1: // Satellite & Ground Station
        if (!scenarioData.satellite_id) {
          errors.satellite_id = 'Satellite selection is required'
        }
        break
      
      case 2: // Steps
        const stepErrors = []
        steps.forEach((step, index) => {
          const stepError = {}
          
          if (!step.title) {
            stepError.title = 'Title is required'
          } else if (step.title.length > 200) {
            stepError.title = 'Title must be 200 characters or fewer'
          }
          
          if (!step.instructions) {
            stepError.instructions = 'Instructions are required'
          } else if (step.instructions.length > 2000) {
            stepError.instructions = 'Instructions must be 2000 characters or fewer'
          }
          
          if (!step.objective) {
            stepError.objective = 'Success criteria is required'
          } else if (step.objective.length > 1000) {
            stepError.objective = 'Success criteria must be 1000 characters or fewer'
          }
          
          if (!step.completionCondition) {
            stepError.completionCondition = 'Completion condition is required'
          } else if (step.completionCondition.length > 1000) {
            stepError.completionCondition = 'Completion condition must be 1000 characters or fewer'
          }
          
          if (!step.hint_suggestion) {
            stepError.hint_suggestion = 'Hint is required'
          } else if (step.hint_suggestion.length > 500) {
            stepError.hint_suggestion = 'Hint must be 500 characters or fewer'
          }
          
          if (step.expectedDurationSeconds < 1) {
            stepError.expectedDurationSeconds = 'Duration must be positive'
          }
          
          if (Object.keys(stepError).length > 0) {
            stepErrors[index] = stepError
          }
        })
        
        if (stepErrors.length > 0) {
          errors.steps = stepErrors
        }
        break
      
      default:
        break
    }
    
    setValidationErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Validation Failed',
        description: 'Please fix the errors before continuing',
        variant: 'destructive'
      })
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setLoading(true)
    try {
      console.log('Current user:', user)
      console.log('Scenario data to submit:', scenarioData)
      
      // Prepare data for backend - convert ground_station_ids array to single ground_station_id
      const backendData = {
        ...scenarioData,
        ground_station_id: scenarioData.ground_station_ids.length > 0 ? scenarioData.ground_station_ids[0] : '',
        // Add default initialState with basic orbital parameters to avoid validation errors
        initialState: {
          orbit: {
            altitude_km: 400,
            inclination_degrees: 51.6,
            eccentricity: 0.0001,
            raan_degrees: 0,
            argumentOfPerigee_degrees: 0,
            trueAnomaly_degrees: 0,
            // Add calculated fields
            perigee_km: 399.96,  // altitude_km * (1 - eccentricity)
            apogee_km: 400.04,    // altitude_km * (1 + eccentricity)
            period_minutes: 92.5, // Approximate for 400km altitude
            semiMajorAxis_km: 6771 // Earth radius (6371) + altitude (400)
          },
          power: {
            currentCharge_percent: 100
          }
        }
      }
      // Remove the array field that backend doesn't expect
      delete backendData.ground_station_ids
      
      console.log('Backend data:', backendData)
      
      let finalScenarioId
      
      if (isEditMode && editId) {
        // Update existing scenario
        await updateScenario(editId, backendData)
        finalScenarioId = editId
        
        // Update or create steps
        for (const step of steps) {
          const stepPayload = {
            ...step,
            scenario_id: finalScenarioId
          }
          delete stepPayload.id // Remove id from payload
          
          if (step.id) {
            // Update existing step
            console.log('Updating step:', step.id, stepPayload)
            await updateScenarioStep(step.id, stepPayload)
          } else {
            // Create new step
            console.log('Creating new step:', stepPayload)
            await createScenarioStep(stepPayload)
          }
        }
        
        toast({
          title: '🚀 Updated!',
          description: `Scenario "${scenarioData.title}" updated successfully`,
        })
      } else {
        // Create scenario with prepared backend data
        const createdScenario = await createScenario(backendData)
        console.log('Scenario created:', createdScenario)
        finalScenarioId = createdScenario.data?.id || createdScenario.id
        
        if (!finalScenarioId) {
          throw new Error('Failed to get scenario ID from response')
        }
        
        console.log('Using scenario ID:', finalScenarioId)

        // Create steps
        for (const step of steps) {
          const stepPayload = {
            ...step,
            scenario_id: finalScenarioId
          }
          console.log('Creating step:', stepPayload)
          await createScenarioStep(stepPayload)
        }

        toast({
          title: '🎉 Success!',
          description: `Scenario "${scenarioData.title}" created successfully`,
        })
      }

      navigate('/admin/scenarios')
    } catch (error) {
      console.error('Submission error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save scenario',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/scenarios')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scenarios
            </Button>
            
            <div className="flex items-center gap-3 mb-2">
              <Rocket className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">
                {isViewMode ? 'View Scenario' : isEditMode ? 'Edit Scenario' : 'Create New Scenario'}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {isViewMode ? 'Review scenario details' : isEditMode ? 'Update scenario information' : 'Build a training mission for satellite operators'}
            </p>
          </div>

          {/* Progress Steps - Clickable for validated steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step} className="flex items-center">
                  <button
                    onClick={() => {
                      // Allow clicking only on steps that have been validated (reached before)
                      if (index <= maxStepReached && index !== currentStep) {
                        setCurrentStep(index)
                      }
                    }}
                    disabled={index > maxStepReached}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      index < currentStep
                        ? 'border-primary bg-primary text-primary-foreground cursor-pointer hover:ring-4 hover:ring-primary/20'
                        : index === currentStep
                        ? 'border-primary bg-primary text-primary-foreground ring-4 ring-primary/20 cursor-default'
                        : index <= maxStepReached
                        ? 'border-primary/60 bg-primary/60 text-primary-foreground cursor-pointer hover:ring-4 hover:ring-primary/20'
                        : 'border-muted bg-background text-muted-foreground cursor-not-allowed'
                    }`}
                    title={
                      index < currentStep 
                        ? `Go back to ${step}` 
                        : index === currentStep 
                        ? `Currently on ${step}` 
                        : index <= maxStepReached
                        ? `Jump to ${step}`
                        : `Click Next to proceed to ${step}`
                    }
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </button>
                  <span className={`ml-2 text-sm font-medium transition-colors ${
                    index <= maxStepReached ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div className={`w-20 h-0.5 mx-4 transition-colors ${
                      index < currentStep ? 'bg-primary' : index === currentStep && index < maxStepReached ? 'bg-primary/60' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep]}</CardTitle>
              <CardDescription>
                {currentStep === 0 && 'Enter basic scenario information'}
                {currentStep === 1 && 'Select the satellite and optional ground station for this mission'}
                {currentStep === 2 && 'Define mission steps and learning objectives'}
                {currentStep === 3 && 'Review and publish your scenario'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Step 0: Basic Info */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={scenarioData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Orbital Insertion Basics"
                        className={validationErrors.title ? 'border-red-500' : ''}
                        disabled={isViewMode}
                        maxLength={200}
                      />
                      {validationErrors.title && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.title}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-sm font-medium">
                        Scenario Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="code"
                        value={scenarioData.code}
                        onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                        placeholder="ROOKIE_ORBIT_101"
                        className={`font-mono ${validationErrors.code ? 'border-red-500' : ''}`}
                        disabled={isViewMode}
                        maxLength={100}
                      />
                      {validationErrors.code ? (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.code}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Uppercase alphanumeric + underscores
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={scenarioData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Learn the fundamentals of orbital mechanics and satellite positioning..."
                      rows={4}
                      className={`w-full resize-none ${validationErrors.description ? 'border-red-500' : ''}`}
                      disabled={isViewMode}
                      maxLength={2000}
                    />
                    <div className="flex justify-between items-center">
                      {validationErrors.description ? (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Detailed mission description and learning objectives
                        </p>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {scenarioData.description.length}/2000
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty" className="text-sm font-medium">Difficulty</Label>
                      <Select
                        value={scenarioData.difficulty}
                        onValueChange={(value) => handleInputChange('difficulty', value)}
                        disabled={isViewMode}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTIES.map(diff => (
                            <SelectItem key={diff} value={diff}>
                              {diff.charAt(0) + diff.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tier" className="text-sm font-medium">Pilot Tier</Label>
                      <Select
                        value={scenarioData.tier}
                        onValueChange={(value) => handleInputChange('tier', value)}
                        disabled={isViewMode}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIERS.map(tier => (
                            <SelectItem key={tier} value={tier}>
                              {tier.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium">Scenario Type</Label>
                      <Select
                        value={scenarioData.type}
                        onValueChange={(value) => handleInputChange('type', value)}
                        disabled={isViewMode}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0) + type.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-medium">
                        Duration (minutes) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={scenarioData.estimatedDurationMinutes}
                        onChange={(e) => handleInputChange('estimatedDurationMinutes', parseInt(e.target.value) || 0)}
                        min={1}
                        max={480}
                        className={validationErrors.estimatedDurationMinutes ? 'border-red-500' : ''}
                        disabled={isViewMode}
                      />
                      {validationErrors.estimatedDurationMinutes && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.estimatedDurationMinutes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-sm font-medium">Tags (comma-separated)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={scenarioData.tags.join(', ')}
                        onChange={(e) => handleArrayInput('tags', e.target.value)}
                        placeholder="orbital-mechanics, power-management, attitude-control"
                        disabled={isViewMode}
                        className="flex-1"
                      />
                      {!isViewMode && (
                        <Button 
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={generateTagSuggestions}
                          className="rounded-lg shrink-0"
                          title="Generate tag suggestions based on title and description"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tags help users find related scenarios • Click ✨ to generate suggestions
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objectives" className="text-sm font-medium">Learning Objectives (comma-separated)</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="objectives"
                        value={scenarioData.objectives.join(', ')}
                        onChange={(e) => handleArrayInput('objectives', e.target.value)}
                        placeholder="Understand orbital velocity, Calculate delta-v requirements, Execute orbital maneuvers"
                        rows={3}
                        className="w-full resize-none flex-1"
                        disabled={isViewMode}
                      />
                      {!isViewMode && (
                        <Button 
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={generateObjectiveSuggestions}
                          className="rounded-lg shrink-0 h-10 w-10"
                          title="Generate learning objectives based on title and description"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      What will operators learn from this scenario? • Click ✨ to generate suggestions
                    </p>
                  </div>
                </div>
              )}

              {/* Step 1: Satellite & Ground Station */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Satellite Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="satellite" className="text-sm font-medium">
                      Select Satellite <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={scenarioData.satellite_id}
                      onValueChange={(value) => handleInputChange('satellite_id', value)}
                      disabled={loading || isViewMode}
                    >
                      <SelectTrigger className={validationErrors.satellite_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder={loading ? "Loading satellites..." : "Choose a satellite..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {satellites.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">No satellites available</div>
                        ) : (
                          satellites.map(sat => (
                            <SelectItem key={sat.id} value={sat.id}>
                              <div className="flex items-center gap-2">
                                <span>{sat.name || sat.id}</span>
                                {sat.status && (
                                  <Badge variant="outline" className="text-xs">
                                    {sat.status}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {validationErrors.satellite_id ? (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.satellite_id}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {satellites.length} satellite{satellites.length !== 1 ? 's' : ''} available
                      </p>
                    )}
                  </div>

                  {/* Ground Station Multi-Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Select Ground Stations <span className="text-muted-foreground">(Optional - Select Multiple)</span>
                    </Label>
                    
                    {/* Selected Ground Stations Display */}
                    {scenarioData.ground_station_ids.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border">
                        {scenarioData.ground_station_ids.map(stationId => {
                          const station = groundStations.find(s => s.id === stationId)
                          if (!station) return null
                          const displayName = station.name || station.code || 'Unknown Station'
                          return (
                            <Badge key={stationId} variant="secondary" className="text-sm py-1 px-3">
                              {displayName}
                              {!isViewMode && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setScenarioData(prev => ({
                                      ...prev,
                                      ground_station_ids: prev.ground_station_ids.filter(id => id !== stationId)
                                    }))
                                  }}
                                  className="ml-2 hover:text-destructive"
                                >
                                  ×
                                </button>
                              )}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                    
                    {/* Ground Station Checkboxes */}
                    {!isViewMode && groundStations.length > 0 && (
                      <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                        {groundStations.map(station => {
                          const displayName = station.name || station.code || 'Unknown Station'
                          const location = station.location || (station.latitude && station.longitude ? `${station.latitude.toFixed(2)}°, ${station.longitude.toFixed(2)}°` : 'Location N/A')
                          const isSelected = scenarioData.ground_station_ids.includes(station.id)
                          
                          return (
                            <label
                              key={station.id}
                              className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setScenarioData(prev => ({
                                      ...prev,
                                      ground_station_ids: [...prev.ground_station_ids, station.id]
                                    }))
                                  } else {
                                    setScenarioData(prev => ({
                                      ...prev,
                                      ground_station_ids: prev.ground_station_ids.filter(id => id !== station.id)
                                    }))
                                  }
                                }}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{displayName}</div>
                                <div className="text-xs text-muted-foreground">{location}</div>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}
                    
                    {groundStations.length === 0 && (
                      <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30">
                        No ground stations available
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {scenarioData.ground_station_ids.length} of {groundStations.length} ground station{groundStations.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">💡 Configuration Note:</strong> Initial satellite state and ground station parameters can be configured later. The selected satellite's default parameters will be used as the starting point for this scenario.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Steps & Objectives */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {steps.map((step, index) => {
                    const stepErrors = validationErrors.steps?.[index] || {}
                    const hasErrors = Object.keys(stepErrors).length > 0
                    
                    return (
                      <Card key={index} className={`border-2 ${hasErrors ? 'border-red-200' : ''}`}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-sm">
                                Step {step.stepOrder}
                              </Badge>
                              {step.isCheckpoint && (
                                <Badge variant="secondary" className="text-xs">
                                  Checkpoint
                                </Badge>
                              )}
                            </div>
                            {steps.length > 1 && !isViewMode && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeStep(index)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Step Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={step.title}
                              onChange={(e) => updateStep(index, 'title', e.target.value)}
                              placeholder="e.g., Check Current Attitude"
                              className={`h-10 ${stepErrors.title ? 'border-red-500' : ''}`}
                              disabled={isViewMode}
                              maxLength={200}
                            />
                            {stepErrors.title && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {stepErrors.title}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Instructions <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              value={step.instructions}
                              onChange={(e) => updateStep(index, 'instructions', e.target.value)}
                              placeholder="Provide detailed instructions for this step..."
                              rows={4}
                              className={`resize-none w-full ${stepErrors.instructions ? 'border-red-500' : ''}`}
                              disabled={isViewMode}
                              maxLength={2000}
                            />
                            {stepErrors.instructions && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {stepErrors.instructions}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Success Criteria (Objective) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={step.objective}
                              onChange={(e) => updateStep(index, 'objective', e.target.value)}
                              placeholder="e.g., Satellite orientation matches target within 2 degrees"
                              className={`h-10 ${stepErrors.objective ? 'border-red-500' : ''}`}
                              disabled={isViewMode}
                              maxLength={1000}
                            />
                            {stepErrors.objective && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {stepErrors.objective}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Completion Condition <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              value={step.completionCondition}
                              onChange={(e) => updateStep(index, 'completionCondition', e.target.value)}
                              placeholder="How the system knows this step is complete (e.g., 'User successfully sends TLE command')..."
                              rows={2}
                              className={`w-full resize-none ${stepErrors.completionCondition ? 'border-red-500' : ''}`}
                              disabled={isViewMode}
                              maxLength={1000}
                            />
                            {stepErrors.completionCondition && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {stepErrors.completionCondition}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Hints for NOVA AI <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              value={step.hint_suggestion}
                              onChange={(e) => updateStep(index, 'hint_suggestion', e.target.value)}
                              placeholder="Hints to help NOVA guide the user..."
                              rows={3}
                              className={`w-full resize-none ${stepErrors.hint_suggestion ? 'border-red-500' : ''}`}
                              disabled={isViewMode}
                              maxLength={500}
                            />
                            {stepErrors.hint_suggestion && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {stepErrors.hint_suggestion}
                              </p>
                            )}
                          </div>

                          {/* Duration & Checkpoint */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Duration (seconds) <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                type="number"
                                value={step.expectedDurationSeconds}
                                onChange={(e) => updateStep(index, 'expectedDurationSeconds', parseInt(e.target.value) || 300)}
                                min={1}
                                className={stepErrors.expectedDurationSeconds ? 'border-red-500' : ''}
                                disabled={isViewMode}
                              />
                              {stepErrors.expectedDurationSeconds && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {stepErrors.expectedDurationSeconds}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`checkpoint-${index}`} className="text-sm font-medium">
                                Checkpoint Status
                              </Label>
                              <div className="flex items-center space-x-2 h-10">
                                <Switch
                                  id={`checkpoint-${index}`}
                                  checked={step.isCheckpoint}
                                  onCheckedChange={(checked) => updateStep(index, 'isCheckpoint', checked)}
                                  disabled={isViewMode}
                                />
                                <Label htmlFor={`checkpoint-${index}`} className="text-sm text-muted-foreground cursor-pointer">
                                  Mark as key milestone
                                </Label>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                  {!isViewMode && (
                    <Button onClick={addStep} variant="outline" className="w-full h-11">
                      <span className="text-lg mr-2">+</span>
                      Add Another Step
                    </Button>
                  )}
                </div>
              )}

              {/* Step 3: Review & Publish - Mission Control Style */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Mission Control Header */}
                  <div className="bg-linear-to-r from-blue-500/10 via-primary/10 to-purple-500/10 border-2 border-primary/30 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Rocket className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">PRE-FLIGHT CHECKLIST</h3>
                        <p className="text-sm text-muted-foreground">Mission Control • Scenario Verification</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{steps.length}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Mission Steps</div>
                      </div>
                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{scenarioData.estimatedDurationMinutes}m</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Est. Duration</div>
                      </div>
                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{scenarioData.difficulty}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Difficulty</div>
                      </div>
                    </div>
                  </div>

                  {/* Mission Parameters Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Panel */}
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          Mission Identification
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mission Code</div>
                          <div className="font-mono font-bold text-lg text-primary">{scenarioData.code}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mission Title</div>
                          <div className="font-semibold text-foreground">{scenarioData.title}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pilot Tier</div>
                          <Badge variant="outline" className="font-semibold">
                            {scenarioData.tier.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mission Type</div>
                          <Badge variant={scenarioData.type === 'GUIDED' ? 'default' : 'secondary'}>
                            {scenarioData.type}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Right Panel */}
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                          Mission Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mission Objectives</div>
                          <div className="text-foreground">
                            {scenarioData.objectives.length > 0 ? (
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                {scenarioData.objectives.slice(0, 2).map((obj, i) => (
                                  <li key={i} className="text-muted-foreground">{obj}</li>
                                ))}
                                {scenarioData.objectives.length > 2 && (
                                  <li className="text-primary">+{scenarioData.objectives.length - 2} more...</li>
                                )}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground italic">No objectives defined</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Classification Tags</div>
                          <div className="flex flex-wrap gap-1">
                            {scenarioData.tags.length > 0 ? (
                              scenarioData.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No tags</span>
                            )}
                            {scenarioData.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{scenarioData.tags.length - 3}</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Mission Description */}
                  <Card className="border-2 border-blue-500/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wider">Mission Briefing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {scenarioData.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Launch Configuration */}
                  <Card className="border-2 border-primary">
                    <CardHeader className="pb-4 bg-primary/5">
                      <CardTitle className="text-base font-bold uppercase tracking-wider flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-primary" />
                        Launch Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {/* Publishing Status */}
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-semibold uppercase tracking-wider">
                          Deployment Status
                        </Label>
                        <Select
                          value={scenarioData.status}
                          onValueChange={(value) => handleInputChange('status', value)}
                          disabled={isViewMode}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map(status => (
                              <SelectItem key={status} value={status}>
                                <span className="font-semibold">
                                  {status === 'DRAFT' && '📝 '}
                                  {status === 'PUBLISHED' && '✅ '}
                                  {status === 'ARCHIVED' && '📦 '}
                                  {status.charAt(0) + status.slice(1).toLowerCase()}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {scenarioData.status === 'DRAFT' && '📝 Mission in development - Not visible to operators'}
                          {scenarioData.status === 'PUBLISHED' && '✅ Mission ready - Available to authorized operators'}
                          {scenarioData.status === 'ARCHIVED' && '📦 Mission archived - Removed from active rotation'}
                        </p>
                      </div>

                      {/* System Flags */}
                      <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">System Flags</h4>
                        
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                          <div className="space-y-0.5">
                            <Label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">
                              ⚡ Active Status
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Enable scenario for operator selection
                            </p>
                          </div>
                          <Switch
                            id="isActive"
                            checked={scenarioData.isActive}
                            onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                            disabled={isViewMode}
                          />
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                          <div className="space-y-0.5">
                            <Label htmlFor="isCore" className="text-sm font-semibold cursor-pointer">
                              🎯 Core Training Module
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Required for pilot tier advancement
                            </p>
                          </div>
                          <Switch
                            id="isCore"
                            checked={scenarioData.isCore}
                            onCheckedChange={(checked) => handleInputChange('isCore', checked)}
                            disabled={isViewMode}
                          />
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-0.5">
                            <Label htmlFor="isPublic" className="text-sm font-semibold cursor-pointer">
                              🌐 Public Access
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Available to all registered operators
                            </p>
                          </div>
                          <Switch
                            id="isPublic"
                            checked={scenarioData.isPublic}
                            onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                            disabled={isViewMode}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Launch Readiness Status */}
                  <div className="relative overflow-hidden rounded-lg border-2 border-green-500/30 bg-linear-to-r from-green-500/10 via-blue-500/10 to-green-500/10 p-6">
                    <div className="relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                          <Check className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-foreground mb-2 uppercase tracking-wide">
                            🚀 MISSION GO FOR LAUNCH
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            All systems nominal. This {scenarioData.type.toLowerCase()} training scenario will be <strong className="text-foreground">{scenarioData.status === 'DRAFT' ? 'saved as draft' : scenarioData.status === 'PUBLISHED' ? 'deployed to operators' : 'moved to archive'}</strong>.
                            {scenarioData.isActive ? ' Mission status: ACTIVE.' : ' Mission status: STANDBY.'}
                            {scenarioData.isCore && ' Flagged as CORE training module.'}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="bg-background/50">
                              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                              All systems GO
                            </Badge>
                            <Badge variant="outline" className="bg-background/50">
                              T-minus: Ready for deployment
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || loading}
              className={currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext} disabled={loading}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              !isViewMode && (
                <Button onClick={handleSubmit} disabled={loading} className="bg-primary">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Update Scenario' : 'Create Scenario'}
                    </>
                  )}
                </Button>
              )
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* NOVA Floating Assistant */}
      <FloatingNovaChat 
        context="help"
        position="left"
      />
    </div>
  )
}
