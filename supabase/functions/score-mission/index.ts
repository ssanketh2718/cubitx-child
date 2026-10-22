// supabase/functions/score-mission/index.ts
// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { attempt_id, answers, is_dev } = await req.json()
    
    if (!attempt_id || !answers) {
        return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: corsHeaders })
    }

    let validUserId = null;

    // 1. AUTHENTICATION & DEV BYPASS
    if (is_dev) {
        validUserId = '857393a7-66f1-4aa7-be30-5885f17cecd1';
    } else {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )
        const { data: { user } } = await supabaseClient.auth.getUser()
        if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders })
        validUserId = user.id;
    }

    // 2. THE DETERMINISTIC RULES ENGINE (NO AI)
    let scores = [];
    
    // Q1: Reasoning
    if (answers.q1 === 'A') scores.push({ skill: 'R1_Reasoning', score: 0, reason: 'Ignored the scam for money.' });
    else if (answers.q1 === 'B') scores.push({ skill: 'R1_Reasoning', score: 4, reason: 'Recognized the scam and chose to protect others.' });
    else scores.push({ skill: 'R1_Reasoning', score: 2, reason: 'Avoided the scam but failed to warn others.' });

    // Q2: Intellectual Grit
    if (answers.q2 === 'Agree') scores.push({ skill: 'C2_Intellectual_Grit', score: 0, reason: 'Caved to peer pressure and normalized bad behavior.' });
    else scores.push({ skill: 'C2_Intellectual_Grit', score: 4, reason: 'Held firm against bad logic.' });

    // Q3: Metacognition / Synthesis
    if (answers.q3 === 'A') scores.push({ skill: 'M4_Metacognition', score: 1, reason: 'Chose a destructive approach.' });
    else if (answers.q3 === 'B') scores.push({ skill: 'M4_Metacognition', score: 4, reason: 'Chose systemic education over destruction.' });
    else scores.push({ skill: 'M4_Metacognition', score: 0, reason: 'Chose blackmail.' });

    // 3. SAVE TO DATABASE
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    for (const score of scores) {
      const { error: dbError } = await supabaseAdmin.from('scores').insert({
        attempt_id: attempt_id,
        student_id: validUserId,
        skill: score.skill,
        score: score.score, // This will now save 4s perfectly
        evidence_quote: score.reason,
        scorer: 'llm', 
        status: 'graded',
        model_version: 'cubitx-rules-v1',
        rubric_version: 'v7.2'
      })
      if (dbError) throw new Error(`Database Error: ${dbError.message}`)
    }

    // 4. RETURN INSTANTLY
    return new Response(JSON.stringify({ 
        status: "graded", 
        scores: scores 
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error("Fortress Error:", error)
    return new Response(JSON.stringify({ 
      status: "pending_review", 
      message: `Backend Error: ${error.message}`, 
      scores: [] 
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  }
})
