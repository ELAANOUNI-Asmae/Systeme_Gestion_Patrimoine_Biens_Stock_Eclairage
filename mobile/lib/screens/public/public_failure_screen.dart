import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../core/localization/bilingual.dart';
import '../../models/lighting.dart';
import '../../state/app_state.dart';
import '../auth/login_screen.dart';

class PublicFailureScreen extends StatefulWidget { const PublicFailureScreen({super.key}); @override State<PublicFailureScreen> createState()=>_PublicFailureScreenState(); }
class _PublicFailureScreenState extends State<PublicFailureScreen> {
  final _location=TextEditingController(); final _description=TextEditingController();
  bool _mapMode=false,_sending=false; LatLng? _picked; int? _reportId; String? _error;
  static const _center=LatLng(30.4208,-9.5981);
  @override void initState(){super.initState();WidgetsBinding.instance.addPostFrameCallback((_){if(mounted)context.read<AppState>().loadPublicLightingData();});}
  @override void dispose(){_location.dispose();_description.dispose();super.dispose();}

  LightPoint? _selected(AppState s){
    if(_mapMode&&_picked!=null){LightPoint? best;double bd=double.infinity;const dist=Distance();for(final l in s.lights){final d=dist.as(LengthUnit.Kilometer,_picked!,LatLng(l.latitude,l.longitude));if(d<bd){bd=d;best=l;}}return best;}
    final q=_location.text.trim().toLowerCase(); if(q.isEmpty)return null;
    LightPoint? best;
    for(final l in s.lights){if(l.localisation.toLowerCase().contains(q)||q.contains(l.localisation.toLowerCase())||l.designation.toLowerCase().contains(q)||l.designationAr.contains(_location.text.trim())){best=l;break;}}
    return best;
  }

  Future<void> _submit() async {
    final s=context.read<AppState>(); final light=_selected(s); setState(()=>_error=null);
    if(light==null){setState(()=>_error=context.tr('Localisation introuvable. Essayez la carte.','تعذر تحديد الموقع. جرب الخريطة.'));return;}
    if(s.unresolvedFailures.any((f)=>f.lightId==light.id)){setState(()=>_error=context.tr('Une panne est déjà en cours de traitement à cet endroit.','يوجد عطب قيد المعالجة في هذا المكان.'));return;}
    if(_description.text.trim().isEmpty){setState(()=>_error=context.tr('Décrivez la panne.','صف العطب.'));return;}
    try{setState(()=>_sending=true);final f=await s.createPublicFailure(lightId:light.id,description:_description.text.trim(),documents:const []);if(mounted)setState(()=>_reportId=f.id);}on StateError catch(e){if(mounted)setState(()=>_error=e.message);}finally{if(mounted)setState(()=>_sending=false);}
  }

  @override Widget build(BuildContext context){final s=context.watch<AppState>();
    return Scaffold(appBar:AppBar(title:Text(context.tr('Déclarer une panne','التبليغ عن عطب')),actions:[TextButton(onPressed:()=>s.setLocale(Locale(s.isArabic?'fr':'ar')),child:Text(s.isArabic?'FR':'AR')),IconButton(tooltip:context.tr('Se connecter','تسجيل الدخول'),icon:const Icon(Icons.login),onPressed:()=>Navigator.of(context).push(MaterialPageRoute(builder:(_)=>const LoginScreen()))) ]),body:SafeArea(child:ListView(padding:const EdgeInsets.all(18),children:[
      Text(context.tr('Signalement public · aucun compte requis','تبليغ عمومي · لا يتطلب حساباً'),style:Theme.of(context).textTheme.labelLarge),const SizedBox(height:8),Text(context.tr('Signaler une panne d’éclairage public','التبليغ عن عطب في الإنارة العمومية'),style:Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight:FontWeight.w900)),const SizedBox(height:8),Text(context.tr('Indiquez où se trouve la panne puis décrivez le problème.','حدد مكان العطب ثم صف المشكلة.')),
      const SizedBox(height:18),if(s.lightingLoading&&s.lights.isEmpty)const Center(child:CircularProgressIndicator()),if(s.lightingError!=null&&s.lights.isEmpty)Text(context.tr('Service temporairement indisponible.','الخدمة غير متاحة مؤقتاً.')),
      if(_reportId!=null)...[Card(child:Padding(padding:const EdgeInsets.all(24),child:Column(children:[const Icon(Icons.check_circle,color:Colors.green,size:56),const SizedBox(height:12),Text(context.tr('Signalement envoyé','تم إرسال التبليغ'),style:Theme.of(context).textTheme.titleLarge),const SizedBox(height:8),Text('P-$_reportId'),const SizedBox(height:16),FilledButton(onPressed:(){setState((){_reportId=null;_location.clear();_description.clear();_picked=null;});},child:Text(context.tr('Nouveau signalement','تبليغ جديد')))]))) ] else ...[
        SegmentedButton<bool>(segments:[ButtonSegment(value:false,label:Text(context.tr('Saisir le lieu','إدخال الموقع')),icon:const Icon(Icons.search)),ButtonSegment(value:true,label:Text(context.tr('Choisir sur la carte','الاختيار من الخريطة')),icon:const Icon(Icons.map))],selected:{_mapMode},onSelectionChanged:(v)=>setState(()=>_mapMode=v.first)),const SizedBox(height:14),
        if(!_mapMode)TextField(controller:_location,onChanged:(_)=>setState((){}),decoration:InputDecoration(labelText:context.tr('Localisation','الموقع'),prefixIcon:const Icon(Icons.location_on_outlined))) else SizedBox(height:330,child:FlutterMap(options:MapOptions(initialCenter:_picked??_center,initialZoom:14,onTap:(_,p)=>setState(()=>_picked=p)),children:[TileLayer(urlTemplate:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',userAgentPackageName:'ma.sgpbse.mobile'),if(_picked!=null)MarkerLayer(markers:[Marker(point:_picked!,width:48,height:48,child:const Icon(Icons.location_pin,size:44,color:Colors.red))])])),
        const SizedBox(height:14),TextField(controller:_description,minLines:4,maxLines:6,decoration:InputDecoration(labelText:context.tr('Description de la panne','وصف العطب'))),if(_error!=null)...[const SizedBox(height:10),Text(_error!,style:TextStyle(color:Theme.of(context).colorScheme.error))],const SizedBox(height:16),FilledButton.icon(onPressed:_sending||s.lightingLoading?null:_submit,icon:const Icon(Icons.warning_amber_rounded),label:Text(_sending?context.tr('Envoi...','جارٍ الإرسال...'):context.tr('Envoyer le signalement','إرسال التبليغ'))),
      ]
    ])));
  }
}
